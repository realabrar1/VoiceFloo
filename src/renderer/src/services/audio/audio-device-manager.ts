import { AudioEvents } from './audio-events'

export interface AudioInputDevice {
  deviceId: string
  label: string
  sampleRate: number
  channels: number
  status: 'active' | 'available'
}

export class AudioDeviceManager {
  private devices: AudioInputDevice[] = []
  private selectedDeviceId: string = 'default'
  private events: AudioEvents

  constructor(events: AudioEvents) {
    this.events = events
    this.setupDeviceChangeListener()
  }

  public getDevices(): AudioInputDevice[] {
    return this.devices
  }

  public getSelectedDeviceId(): string {
    return this.selectedDeviceId
  }

  /**
   * Set the current active microphone device.
   */
  public async selectDevice(deviceId: string): Promise<void> {
    this.selectedDeviceId = deviceId
    await this.refreshDevices()
    this.events.emit('DeviceChanged', this.selectedDeviceId)
  }

  /**
   * Scan system microphones and update local state cache.
   */
  public async refreshDevices(): Promise<AudioInputDevice[]> {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = mediaDevices.filter((device) => device.kind === 'audioinput')
      
      this.devices = audioInputs.map((device) => {
        const id = device.deviceId || 'default'
        const label = device.label || (id === 'default' ? 'Default Microphone' : `Microphone (${id.slice(0, 5)})`)
        
        return {
          deviceId: id,
          label: label,
          sampleRate: 16000, // We force 16000Hz (downsampled mono PCM) for whisper compatibility
          channels: 1,       // Mono
          status: id === this.selectedDeviceId ? 'active' : 'available'
        }
      })

      // Fallback if the selected microphone was unplugged
      const exists = this.devices.some((d) => d.deviceId === this.selectedDeviceId)
      if (!exists && this.devices.length > 0) {
        this.selectedDeviceId = this.devices[0].deviceId
        this.devices[0].status = 'active'
        this.events.emit('DeviceChanged', this.selectedDeviceId)
      }

      return this.devices
    } catch (err) {
      console.error('Failed to list media devices:', err)
      return []
    }
  }

  /**
   * Listen for USB/Bluetooth/Headset plug-in and unplug events.
   */
  private setupDeviceChangeListener(): void {
    navigator.mediaDevices.ondevicechange = async () => {
      console.log('Media device change detected (hot-plugging)')
      const prevDevicesCount = this.devices.length
      await this.refreshDevices()
      
      this.events.emit('DevicesUpdated', this.devices)
      
      // If devices list changed, log it and notify
      if (this.devices.length !== prevDevicesCount) {
        this.events.emit('DeviceListModified', this.devices)
      }
    }
  }
}
