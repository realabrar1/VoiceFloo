import { app } from 'electron'
import { spawn } from 'child_process'
import { existsSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { modelManager } from './model.manager'
import { logger } from './logger.service'

export interface TranscriptionOptions {
  modelId: string
  language: string
  threads: number
}

export class WhisperService {
  private activeProcesses: Map<string, any> = new Map()

  /**
   * Transcribe raw Int16 PCM array samples using the whisper.cpp binary.
   */
  public async transcribe(
    sessionId: string,
    pcmSamples: Int16Array,
    options: TranscriptionOptions
  ): Promise<string> {
    const tempWavPath = join(app.getPath('temp'), `voicefloo_trans_${sessionId}.wav`)

    try {
      // 1. Pack samples into WAV format and write to disk
      const wavBuffer = this.encodeWav(pcmSamples)
      writeFileSync(tempWavPath, wavBuffer)

      // 2. Validate paths
      const exePath = modelManager.getWhisperExecutablePath()
      const modelPath = modelManager.getModelPath(options.modelId)

      if (!existsSync(exePath)) {
        throw new Error('Whisper executable not found. Please complete the setup wizard.')
      }
      if (!existsSync(modelPath)) {
        throw new Error(`GGML Model file for '${options.modelId}' was not found.`)
      }

      // 3. Assemble command-line arguments
      const args = [
        '-m', modelPath,
        '-f', tempWavPath,
        '-nt', // Remove timestamps in output text
        '-t', String(options.threads || 4) // CPU Core thread settings
      ]

      if (options.language && options.language !== 'auto') {
        args.push('-l', options.language)
      }

      const transcript = await this.executeSubprocess(sessionId, exePath, args)
      
      this.cleanupTempFile(tempWavPath)
      
      return this.formatTranscript(transcript)
    } catch (err) {
      this.cleanupTempFile(tempWavPath)
      throw err
    }
  }

  /**
   * Forcefully terminate an active subprocess for a session.
   */
  public cancel(sessionId: string): void {
    const child = this.activeProcesses.get(sessionId)
    if (child) {
      child.kill('SIGKILL')
      this.activeProcesses.delete(sessionId)
      logger.info(`WhisperService: Terminated active process for session: ${sessionId}`)
    }
  }

  /**
   * Spawn execution process.
   */
  private executeSubprocess(
    sessionId: string,
    exePath: string,
    args: string[]
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(exePath, args)
      this.activeProcesses.set(sessionId, child)

      let stdoutAccum = ''
      let stderrAccum = ''

      child.stdout.on('data', (data) => {
        stdoutAccum += data.toString()
      })

      child.stderr.on('data', (data) => {
        stderrAccum += data.toString()
      })

      child.on('close', (code) => {
        this.activeProcesses.delete(sessionId)
        if (code === 0 || code === null) {
          resolve(stdoutAccum)
        } else {
          logger.error(`WhisperService: Execution failed (code ${code}): ${stderrAccum}`)
          reject(new Error(`Whisper compilation failed: ${stderrAccum || 'Unknown executable exit code'}`))
        }
      })

      child.on('error', (err) => {
        this.activeProcesses.delete(sessionId)
        reject(err)
      })
    })
  }

  /**
   * Capitalize, trim, and punctuation-format text lines.
   */
  private formatTranscript(text: string): string {
    let formatted = text
      .replace(/\[\d\d:\d\d:\d\d\.\d\d\d\s-->\s\d\d:\d\d:\d\d\.\d\d\d\]/g, '') // Strip leaked time stamps
      .replace(/\s+/g, ' ') // Strip duplicates spaces
      .replace(/[\r\n]+/g, ' ') // Strip new lines
      .trim()

    if (formatted.length > 0) {
      // Capitalize first character
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)
      
      // Append terminal period if missing
      if (!/[.!?]$/.test(formatted)) {
        formatted += '.'
      }
    }

    return formatted
  }

  private cleanupTempFile(filePath: string): void {
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
    } catch (err: any) {
      logger.error(`WhisperService: Failed to erase temporary file: ${filePath}. Error: ${err.message}`)
    }
  }

  /**
   * Encodes 16kHz Int16 Mono PCM into a 44-byte WAV header RIFF buffer.
   */
  private encodeWav(samples: Int16Array, sampleRate: number = 16000): Buffer {
    const buffer = Buffer.alloc(44 + samples.length * 2)
    
    // Chunk ID
    buffer.write('RIFF', 0)
    // Chunk size
    buffer.writeUInt32LE(36 + samples.length * 2, 4)
    // Format
    buffer.write('WAVE', 8)
    
    // Sub-chunk fmt
    buffer.write('fmt ', 12)
    buffer.writeUInt32LE(16, 16) // Sub-chunk size
    buffer.writeUInt16LE(1, 20)  // Audio format (1 = PCM)
    buffer.writeUInt16LE(1, 22)  // Channels (1 = Mono)
    buffer.writeUInt32LE(sampleRate, 24)
    buffer.writeUInt32LE(sampleRate * 2, 28) // Byte rate
    buffer.writeUInt16LE(2, 32)  // Block align
    buffer.writeUInt16LE(16, 34) // Bits per sample
    
    // Sub-chunk data
    buffer.write('data', 36)
    buffer.writeUInt32LE(samples.length * 2, 40)
    
    // Copy sample arrays
    let offset = 44
    for (let i = 0; i < samples.length; i++) {
      buffer.writeInt16LE(samples[i], offset)
      offset += 2
    }
    
    return buffer
  }
}

export const whisperService = new WhisperService()
