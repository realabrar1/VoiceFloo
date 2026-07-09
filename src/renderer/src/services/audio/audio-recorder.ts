import { AudioEvents } from './audio-events'
import { AudioBufferManager } from './audio-buffer-manager'
import { AudioLevelAnalyzer } from './audio-level-analyzer'

export interface RecordingSession {
  id: string
  startTime: number
  duration: number // in seconds
  sampleRate: number
  bitDepth: number
  channels: number
}

export class AudioRecorder {
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private processorNode: ScriptProcessorNode | null = null
  
  private events: AudioEvents
  private bufferManager: AudioBufferManager
  private levelAnalyzer: AudioLevelAnalyzer

  private session: RecordingSession | null = null
  private durationInterval: NodeJS.Timeout | null = null
  private isPaused: boolean = false
  private recordStartTime: number = 0
  private totalPausedDuration: number = 0
  private lastPauseTime: number = 0

  constructor(
    events: AudioEvents,
    bufferManager: AudioBufferManager,
    levelAnalyzer: AudioLevelAnalyzer
  ) {
    this.events = events
    this.bufferManager = bufferManager
    this.levelAnalyzer = levelAnalyzer
  }

  public getSession(): RecordingSession | null {
    return this.session
  }

  public getIsPaused(): boolean {
    return this.isPaused
  }

  /**
   * Start a recording session using the selected microphone device ID.
   */
  public async start(deviceId: string): Promise<void> {
    try {
      if (this.audioContext) {
        await this.stop()
      }

      this.isPaused = false
      this.totalPausedDuration = 0
      this.lastPauseTime = 0
      this.bufferManager.start()
      this.levelAnalyzer.reset()

      // Set hardware constraints. 
      // Downsampling to 16kHz mono is handled automatically by browser AudioContext configuration.
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId === 'default' ? undefined : { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Instantiate standard AudioContext targeting 16kHz
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      })

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)
      
      // Buffer frame chunks at 2048 size
      this.processorNode = this.audioContext.createScriptProcessor(2048, 1, 1)

      this.processorNode.onaudioprocess = (e) => {
        if (this.isPaused) {
          return
        }

        const inputBuffer = e.inputBuffer
        const floatData = inputBuffer.getChannelData(0) // Left/Mono channel raw float32 samples

        // Feed volume decibel analyzer
        const level = this.levelAnalyzer.analyze(floatData)
        this.events.emit('AudioLevelChanged', level)

        // Convert Float32 to Int16 PCM array buffers
        const int16Data = this.convertFloat32ToInt16(floatData)
        this.bufferManager.append(int16Data)
      }

      this.sourceNode.connect(this.processorNode)
      this.processorNode.connect(this.audioContext.destination)

      this.recordStartTime = Date.now()
      this.session = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        startTime: this.recordStartTime,
        duration: 0,
        sampleRate: 16000,
        bitDepth: 16,
        channels: 1
      }

      // Emit start status event
      this.events.emit('RecordingStarted', this.session)

      // Start duration ticker
      this.durationInterval = setInterval(() => {
        if (this.session && !this.isPaused) {
          const currentElapsed = Date.now() - this.recordStartTime - this.totalPausedDuration
          this.session.duration = Math.floor(currentElapsed / 1000)
          this.events.emit('RecordingDurationUpdated', this.session.duration)
        }
      }, 1000)

      console.log('AudioRecorder: Recording session initialized.', this.session)
    } catch (err) {
      console.error('AudioRecorder: Failed to start recording:', err)
      this.events.emit('RecordingError', err)
      throw err
    }
  }

  /**
   * Pause the active recording session.
   */
  public pause(): void {
    if (!this.session || this.isPaused) return
    this.isPaused = true
    this.lastPauseTime = Date.now()
    this.events.emit('RecordingPaused')
    console.log('AudioRecorder: Recording session paused.')
  }

  /**
   * Resume the paused recording session.
   */
  public resume(): void {
    if (!this.session || !this.isPaused) return
    this.isPaused = false
    this.totalPausedDuration += (Date.now() - this.lastPauseTime)
    this.events.emit('RecordingResumed')
    console.log('AudioRecorder: Recording session resumed.')
  }

  /**
   * Stop the session, clean up nodes, and return the recorded PCM array.
   */
  public async stop(): Promise<Int16Array | null> {
    if (!this.session) return null

    console.log('AudioRecorder: Stopping recording session...')
    const audioData = this.bufferManager.getRawBuffer()

    const stoppedSession = { ...this.session }
    this.cleanupNodes()
    
    this.events.emit('RecordingStopped', stoppedSession, audioData)
    this.session = null
    return audioData
  }

  /**
   * Cancel the session and purge the buffer.
   */
  public cancel(): void {
    if (!this.session) return
    this.cleanupNodes()
    this.bufferManager.clear()
    this.events.emit('RecordingCancelled')
    this.session = null
    console.log('AudioRecorder: Recording session cancelled. Buffer cleared.')
  }

  /**
   * Disconnect Audio Nodes and close contexts.
   */
  private cleanupNodes(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval)
      this.durationInterval = null
    }

    if (this.processorNode) {
      this.processorNode.disconnect()
      this.processorNode = null
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    if (this.audioContext) {
      this.audioContext.close().catch((err) => console.error('AudioContext close error:', err))
      this.audioContext = null
    }

    this.levelAnalyzer.reset()
  }

  /**
   * Convert Float32 samples [-1.0, 1.0] to Int16 samples [-32768, 32767]
   */
  private convertFloat32ToInt16(samples: Float32Array): Int16Array {
    const output = new Int16Array(samples.length)
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    return output
  }
}
