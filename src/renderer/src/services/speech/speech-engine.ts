import { audioEngine } from '../audio/audio-engine'

export interface SpeechEngineOptions {
  modelId: string
  language: string // 'en', 'es', 'fr', etc. or 'auto'
  threads: number
  vadEnabled: boolean
  vadSilenceTimeoutMs: number
}

export class SpeechEngine {
  private currentTranscript: string = ''
  private isTranscribing: boolean = false
  private timer: NodeJS.Timeout | null = null
  private activeSessionId: string | null = null
  
  // VAD and silence markers
  private isSilent: boolean = true
  private lastSpeechTime: number = 0
  private vadThreshold: number = 0.015 // RMS limit trigger

  private options: SpeechEngineOptions = {
    modelId: 'base',
    language: 'en',
    threads: 4,
    vadEnabled: true,
    vadSilenceTimeoutMs: 2500
  }

  constructor() {
    this.setupAudioListeners()
  }

  public getTranscript(): string {
    return this.currentTranscript
  }

  public setOptions(opts: Partial<SpeechEngineOptions>): void {
    this.options = { ...this.options, ...opts }
    console.log('SpeechEngine: Configuration updated.', this.options)
  }

  public getOptions(): SpeechEngineOptions {
    return this.options
  }

  /**
   * Start live speech recognition scheduler.
   */
  public startSession(sessionId: string): void {
    this.activeSessionId = sessionId
    this.currentTranscript = ''
    this.isSilent = true
    this.lastSpeechTime = Date.now()

    // Query Whisper transcription updates every 1.5s
    this.timer = setInterval(() => {
      this.runLiveTranscription()
    }, 1500)

    audioEngine.events.emit('SpeechStarted')
    console.log('SpeechEngine: Speech recognition session started.', sessionId)
  }

  /**
   * Pause the speech recognition runner.
   */
  public pauseRecording(): void {
    this.cleanupTimer()
    console.log('SpeechEngine: Session paused.')
  }

  /**
   * Resume the speech recognition runner.
   */
  public resumeRecording(): void {
    if (this.activeSessionId && !this.timer) {
      this.timer = setInterval(() => {
        this.runLiveTranscription()
      }, 1500)
    }
    console.log('SpeechEngine: Session resumed.')
  }

  /**
   * Complete the session, performing a final full-buffer transcription pass.
   */
  public async stopSession(): Promise<string> {
    this.cleanupTimer()

    if (this.activeSessionId) {
      const pcmData = audioEngine.buffer.getRawBuffer()
      if (pcmData.length > 0) {
        try {
          console.log(`SpeechEngine: Running final transcription on ${pcmData.length} samples.`)
          this.currentTranscript = await window.api.transcribeAudio(
            this.activeSessionId,
            pcmData.buffer as ArrayBuffer,
            {
              modelId: this.options.modelId,
              language: this.options.language,
              threads: this.options.threads
            }
          )
        } catch (err) {
          console.error('SpeechEngine: Final transcription run failed:', err)
        }
      }
    }

    const finalResult = this.currentTranscript
    audioEngine.events.emit('SpeechStopped', finalResult)
    this.activeSessionId = null
    return finalResult
  }

  /**
   * Cancel and discard current active session.
   */
  public cancelSession(): void {
    this.cleanupTimer()
    if (this.activeSessionId) {
      window.api.cancelTranscription(this.activeSessionId)
      this.activeSessionId = null
    }
    this.currentTranscript = ''
    audioEngine.events.emit('SpeechStopped', '')
    console.log('SpeechEngine: Session cancelled.')
  }

  private cleanupTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * Fetch current raw buffer and run whisper.cpp.
   * Skip runs if transcribing or if silence threshold is active.
   */
  private async runLiveTranscription(): Promise<void> {
    if (!this.activeSessionId || this.isTranscribing) return

    // VAD Check: If user is silent, skip CPU execution cycles
    if (this.options.vadEnabled && this.isSilent) {
      const msSinceLastSpeech = Date.now() - this.lastSpeechTime
      if (msSinceLastSpeech > this.options.vadSilenceTimeoutMs) {
        return
      }
    }

    const pcmData = audioEngine.buffer.getRawBuffer()
    // Need at least 0.5s of audio to justify transcription (8000 samples)
    if (pcmData.length < 8000) return

    this.isTranscribing = true

    try {
      const result = await window.api.transcribeAudio(
        this.activeSessionId,
        pcmData.buffer as ArrayBuffer,
        {
          modelId: this.options.modelId,
          language: this.options.language,
          threads: this.options.threads
        }
      )

      if (this.activeSessionId) {
        this.currentTranscript = result
        audioEngine.events.emit('TranscriptUpdated', this.currentTranscript)
      }
    } catch (err) {
      console.warn('SpeechEngine: Intermediate transcribe loop error:', err)
    } finally {
      this.isTranscribing = false
    }
  }

  /**
   * Bind level changes to capture live speech peaks and trigger silence gates.
   */
  private setupAudioListeners(): void {
    audioEngine.events.on('AudioLevelChanged', (level: number) => {
      if (!this.activeSessionId) return

      if (level > this.vadThreshold) {
        this.lastSpeechTime = Date.now()
        if (this.isSilent) {
          this.isSilent = false
          audioEngine.events.emit('SpeechActive')
        }
      } else {
        const msSinceLastSpeech = Date.now() - this.lastSpeechTime
        if (!this.isSilent && msSinceLastSpeech > this.options.vadSilenceTimeoutMs) {
          this.isSilent = true
          audioEngine.events.emit('SilenceDetected')
        }
      }
    })
  }
}

export const speechEngine = new SpeechEngine()
