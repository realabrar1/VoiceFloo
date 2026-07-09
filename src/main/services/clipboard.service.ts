import { clipboard } from 'electron'
import { keyboardService } from './keyboard.service'

export interface ClipboardBackup {
  text: string
  html: string
  image: any // NativeImage
}

export class ClipboardService {
  /**
   * Pastes text into the foreground active application window via the clipboard,
   * automatically restoring the user's original multi-format clipboard content.
   */
  public async pasteText(text: string): Promise<boolean> {
    try {
      // 1. Back up clipboard formats
      const backup = this.backup()

      // 2. Load the transcription text
      clipboard.writeText(text)

      // 3. Emulate Ctrl+V
      await keyboardService.sendCombo('^v')

      // 4. Delay to let target program register clip data
      await new Promise((resolve) => setTimeout(resolve, 80))

      // 5. Restore clipboard contents
      this.restore(backup)
      return true
    } catch (err) {
      console.error('ClipboardService: Paste action failed:', err)
      return false
    }
  }

  /**
   * Backs up standard text, rich html, and image clipboard payloads.
   */
  private backup(): ClipboardBackup {
    return {
      text: clipboard.readText(),
      html: clipboard.readHTML(),
      image: clipboard.readImage()
    }
  }

  /**
   * Restores original clipboard values.
   */
  private restore(backup: ClipboardBackup): void {
    clipboard.clear()
    
    // Write text/html back
    if (backup.text) {
      clipboard.writeText(backup.text)
    }
    if (backup.html) {
      clipboard.writeHTML(backup.html)
    }
    
    // Write image if populated
    if (backup.image && !backup.image.isEmpty()) {
      clipboard.writeImage(backup.image)
    }
  }
}

export const clipboardService = new ClipboardService()
