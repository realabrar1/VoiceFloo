export class AudioLevelAnalyzer {
  private currentLevel: number = 0
  // Value between 0 and 1. Lower means smoother transitions (damping).
  private smoothingFactor: number = 0.2 

  /**
   * Compute the audio level (0.0 to 1.0) using Root Mean Square (RMS) volume calculation.
   * Smooths the result to avoid jittery jumps.
   */
  public analyze(samples: Float32Array): number {
    if (samples.length === 0) {
      return this.currentLevel
    }

    let sum = 0
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i]
    }
    
    const rms = Math.sqrt(sum / samples.length)
    
    // Scale RMS to a natural 0.0 - 1.0 visual volume range.
    // Speech peaks typically hover around 0.05 to 0.2 RMS natively.
    const targetLevel = Math.min(1.0, rms * 5.0)

    // Exponential smoothing filter
    this.currentLevel = this.currentLevel * (1 - this.smoothingFactor) + targetLevel * this.smoothingFactor

    // Noise gate threshold: clear level to zero if it's very quiet
    if (this.currentLevel < 0.005) {
      this.currentLevel = 0
    }

    return this.currentLevel
  }

  public getLevel(): number {
    return this.currentLevel
  }

  public reset(): void {
    this.currentLevel = 0
  }
}
