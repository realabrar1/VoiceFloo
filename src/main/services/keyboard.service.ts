import { exec } from 'child_process'
import { logger } from './logger.service'

export class KeyboardService {
  /**
   * Type text into the active focused window using Windows SendKeys forms.
   * If delayMs is specified, types character-by-character to simulate user keyboard speed.
   */
  public async typeText(text: string, delayMs: number = 0): Promise<void> {
    if (text.length === 0) return

    if (delayMs > 0) {
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const escaped = this.escapeSendKeys(char)
        await this.sendRawKeys(escaped)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } else {
      const escaped = this.escapeSendKeys(text)
      await this.sendRawKeys(escaped)
    }
  }

  /**
   * Sends a key combo / control shortcut (e.g. "^v" for Ctrl+V, "{ENTER}", "^{BACKSPACE}").
   */
  public async sendCombo(combo: string): Promise<void> {
    await this.sendRawKeys(combo)
  }

  /**
   * Execute keypresses via a quiet PowerShell SendKeys process.
   */
  private sendRawKeys(keys: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (process.platform !== 'win32') {
        resolve()
        return
      }

      // Escape single quotes for PowerShell string literal compatibility
      const escapedKeys = keys.replace(/'/g, "''")
      const script = `
        Add-Type -AssemblyName System.Windows.Forms;
        [System.Windows.Forms.SendKeys]::SendWait('${escapedKeys}')
      `.replace(/\r?\n/g, ' ').trim()

      exec(`powershell -Command "${script}"`, (err, _stdout, stderr) => {
        if (err) {
          logger.error(`KeyboardService: SendKeys execution failed: ${stderr || err.message}`)
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  /**
   * Escapes characters that have active meanings inside SendKeys (+, ^, %, ~, (, ), [, ], {, }).
   */
  private escapeSendKeys(text: string): string {
    let escaped = ''
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (['+', '^', '%', '~', '(', ')', '[', ']', '{', '}'].includes(char)) {
        escaped += `{${char}}`
      } else {
        escaped += char
      }
    }
    return escaped
  }
}

export const keyboardService = new KeyboardService()
