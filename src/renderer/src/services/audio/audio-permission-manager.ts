export class AudioPermissionManager {
  /**
   * Query the current microphone access status.
   */
  public async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        return permissionStatus.state
      }
      
      // Fallback: Check if device labels are populated (which requires previous permission grant)
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasLabels = devices.some((d) => d.kind === 'audioinput' && d.label !== '')
      return hasLabels ? 'granted' : 'prompt'
    } catch (err) {
      console.warn('Permissions API check failed, falling back to prompt status', err)
      return 'prompt'
    }
  }

  /**
   * Request microphone permissions from the user.
   * Returns true if granted, false otherwise.
   */
  public async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Release audio stream tracks immediately after checking permission
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch (err) {
      console.error('Microphone permission request failed:', err)
      return false
    }
  }
}

export const audioPermissionManager = new AudioPermissionManager()
