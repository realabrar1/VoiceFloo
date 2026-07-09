export class AudioBufferManager {
  private chunks: Int16Array[] = []
  // Max size limit (e.g. 50MB of raw Int16 audio is ~26 minutes at 16kHz mono)
  private maxBufferSize: number = 1024 * 1024 * 50 

  /**
   * Prepare/Start the buffer.
   */
  public start(): void {
    this.clear()
  }

  /**
   * Append a new Int16Array audio sample chunk.
   */
  public append(chunk: Int16Array): void {
    const totalLength = this.getTotalSampleLength()
    
    // Overflow protection: discard older chunks if limit is reached
    if (totalLength + chunk.length > this.maxBufferSize) {
      console.warn('AudioBufferManager: Buffer overflow limit reached. Discarding oldest chunks.')
      while (this.getTotalSampleLength() + chunk.length > this.maxBufferSize && this.chunks.length > 0) {
        this.chunks.shift()
      }
    }
    
    this.chunks.push(chunk)
  }

  /**
   * Get the total count of accumulated audio samples.
   */
  public getTotalSampleLength(): number {
    return this.chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  }

  /**
   * Flushes (retrieves and clears) all audio chunks, returning a merged Int16Array.
   */
  public flush(): Int16Array {
    const merged = this.getRawBuffer()
    this.clear()
    return merged
  }

  /**
   * Merge all chunks into a single Int16Array without clearing the buffer.
   */
  public getRawBuffer(): Int16Array {
    const totalLength = this.getTotalSampleLength()
    const mergedArray = new Int16Array(totalLength)
    
    let offset = 0
    for (const chunk of this.chunks) {
      mergedArray.set(chunk, offset)
      offset += chunk.length
    }
    
    return mergedArray
  }

  /**
   * Clear the buffer cache completely.
   */
  public clear(): void {
    this.chunks = []
  }
}

export const audioBufferManager = new AudioBufferManager()
