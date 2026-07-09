type EventCallback = (...args: any[]) => void

export class AudioEvents {
  private events: { [key: string]: EventCallback[] } = {}

  /**
   * Subscribe to an event.
   */
  public on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  /**
   * Unsubscribe from an event.
   */
  public off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter((cb) => cb !== callback)
  }

  /**
   * Emit an event triggering all registered listener callbacks.
   */
  public emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return
    this.events[event].forEach((callback) => {
      try {
        callback(...args)
      } catch (err) {
        console.error(`Error in audio event listener for ${event}:`, err)
      }
    })
  }

  /**
   * Clear all registered event listeners.
   */
  public clear(): void {
    this.events = {}
  }
}
