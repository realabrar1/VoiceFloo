import { AudioEvents } from './audio-events'
import { audioPermissionManager, AudioPermissionManager } from './audio-permission-manager'
import { AudioDeviceManager } from './audio-device-manager'
import { audioBufferManager, AudioBufferManager } from './audio-buffer-manager'
import { AudioLevelAnalyzer } from './audio-level-analyzer'
import { AudioRecorder } from './audio-recorder'

export class AudioEngine {
  public events: AudioEvents
  public permissions: AudioPermissionManager
  public devices: AudioDeviceManager
  public buffer: AudioBufferManager
  public level: AudioLevelAnalyzer
  public recorder: AudioRecorder

  private currentStatus: 'idle' | 'recording' | 'paused' | 'error' = 'idle'

  constructor() {
    this.events = new AudioEvents()
    this.permissions = audioPermissionManager
    this.devices = new AudioDeviceManager(this.events)
    this.buffer = audioBufferManager
    this.level = new AudioLevelAnalyzer()
    this.recorder = new AudioRecorder(this.events, this.buffer, this.level)

    this.setupInternalListeners()
  }

  public getStatus(): 'idle' | 'recording' | 'paused' | 'error' {
    return this.currentStatus
  }

  /**
   * Run startup diagnostics: verify permissions and preload device inputs.
   */
  public async initialize(): Promise<void> {
    const permissionState = await this.permissions.checkPermission()
    if (permissionState === 'granted') {
      await this.devices.refreshDevices()
    }
  }

  /**
   * Request permissions if needed, and start audio stream capture.
   */
  public async startRecording(): Promise<void> {
    try {
      const permissionState = await this.permissions.checkPermission()
      if (permissionState !== 'granted') {
        const granted = await this.permissions.requestPermission()
        if (!granted) {
          this.currentStatus = 'error'
          this.events.emit('PermissionDenied')
          throw new Error('Microphone permission not granted')
        }
        this.events.emit('PermissionGranted')
        await this.devices.refreshDevices()
      }

      const activeDeviceId = this.devices.getSelectedDeviceId()
      await this.recorder.start(activeDeviceId)
      this.currentStatus = 'recording'
    } catch (err) {
      console.error('AudioEngine: Failed to start recording:', err)
      this.currentStatus = 'error'
      throw err
    }
  }

  /**
   * Pause the active recording session.
   */
  public pauseRecording(): void {
    if (this.currentStatus !== 'recording') return
    this.recorder.pause()
    this.currentStatus = 'paused'
  }

  /**
   * Resume the paused recording session.
   */
  public resumeRecording(): void {
    if (this.currentStatus !== 'paused') return
    this.recorder.resume()
    this.currentStatus = 'recording'
  }

  /**
   * Stop recording and return the accumulated PCM buffer array.
   */
  public async stopRecording(): Promise<Int16Array | null> {
    if (this.currentStatus !== 'recording' && this.currentStatus !== 'paused') {
      return null
    }
    const data = await this.recorder.stop()
    this.currentStatus = 'idle'
    return data
  }

  /**
   * Cancel and discard current recording.
   */
  public cancelRecording(): void {
    if (this.currentStatus !== 'recording' && this.currentStatus !== 'paused') {
      return
    }
    this.recorder.cancel()
    this.currentStatus = 'idle'
  }

  /**
   * Wire internal handlers.
   */
  private setupInternalListeners(): void {
    // If the microphone is switched during active recording, hot-swap the stream
    this.events.on('DeviceChanged', async (deviceId: string) => {
      if (this.currentStatus === 'recording') {
        console.log(`AudioEngine: Active device changed to ${deviceId}. Hot-swapping stream.`)
        try {
          await this.recorder.start(deviceId)
        } catch (err) {
          console.error('AudioEngine: Hot-swapping recording device failed', err)
          this.currentStatus = 'error'
        }
      }
    })

    this.events.on('RecordingError', () => {
      this.currentStatus = 'error'
    })
  }
}

export const audioEngine = new AudioEngine()
