import { keyboardService } from './keyboard.service'
import { clipboardService } from './clipboard.service'
import { logger } from './logger.service'

export interface InputEngineOptions {
  strategy: 'auto' | 'keyboard' | 'clipboard'
  typingSpeed: number // character typing delay in milliseconds
  autoRestoreClipboard: boolean
  delayBeforeTyping: number // start delay in milliseconds
  voiceCommandsEnabled: boolean
}

export class InputEngine {
  private lastInsertedText: string = ''
  private options: InputEngineOptions = {
    strategy: 'auto',
    typingSpeed: 0,
    autoRestoreClipboard: true,
    delayBeforeTyping: 50,
    voiceCommandsEnabled: true
  }

  // FIFO queues to ensure sequential insertion tasks
  private queue: { text: string; isFinal: boolean; resolve: () => void }[] = []
  private isProcessingQueue: boolean = false

  public getOptions(): InputEngineOptions {
    return this.options
  }

  public setOptions(opts: Partial<InputEngineOptions>): void {
    this.options = { ...this.options, ...opts }
    logger.info(`InputEngine: Options updated: ${JSON.stringify(this.options)}`)
  }

  /**
   * Resets the active transcription diff state.
   */
  public resetSession(): void {
    this.lastInsertedText = ''
    this.queue = []
    this.isProcessingQueue = false
    logger.info('InputEngine: Transcription session reset.')
  }

  /**
   * Enqueues a transcription update request.
   */
  public handleInput(text: string, isFinal: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push({ text, isFinal, resolve })
      this.processQueue()
    })
  }

  /**
   * Processes the FIFO queue items sequentially.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) return
    this.isProcessingQueue = true

    const task = this.queue.shift()!

    try {
      // First launch delay offset
      if (this.options.delayBeforeTyping > 0 && this.lastInsertedText === '') {
        await new Promise((resolve) => setTimeout(resolve, this.options.delayBeforeTyping))
      }

      // Compute character-level deletions and insertions
      const { deleteCount, insertText } = this.computeDiff(this.lastInsertedText, task.text)
      this.lastInsertedText = task.text

      // Send backspace corrections if whisper corrected historical words
      if (deleteCount > 0) {
        logger.info(`InputEngine: Correcting state. Deleting ${deleteCount} characters.`)
        await keyboardService.sendCombo(`{BACKSPACE ${deleteCount}}`)
      }

      if (insertText.length > 0) {
        if (task.isFinal) {
          // Paste strategy on stop/complete for maximum speed
          const useClipboard = this.options.strategy === 'auto' || this.options.strategy === 'clipboard'
          if (useClipboard) {
            logger.info(`InputEngine: Pasting final text via clipboard. Size: ${insertText.length} chars.`)
            await clipboardService.pasteText(insertText)
          } else {
            try {
              logger.info(`InputEngine: Typing final text via keys. Size: ${insertText.length} chars.`)
              await keyboardService.typeText(insertText, this.options.typingSpeed)
            } catch (err: any) {
              logger.warn(`InputEngine: Keyboard typing failed: ${err.message}. Falling back to clipboard paste.`)
              await clipboardService.pasteText(insertText)
            }
          }
        } else {
          // Type new streaming words in real-time
          try {
            await this.processStringWithCommands(insertText)
          } catch (err: any) {
            logger.warn(`InputEngine: Streaming keyboard typing failed: ${err.message}. Falling back to clipboard paste.`)
            await clipboardService.pasteText(insertText)
          }
        }
      }
    } catch (err: any) {
      logger.error(`InputEngine: Process task error: ${err.message}`)
    } finally {
      task.resolve()
      this.isProcessingQueue = false
      // Recurse to run next task
      this.processQueue()
    }
  }

  /**
   * Computes character-level deletions and suffixes between old and new state.
   */
  private computeDiff(oldText: string, newText: string): { deleteCount: number; insertText: string } {
    let commonPrefixLen = 0
    const minLen = Math.min(oldText.length, newText.length)

    while (commonPrefixLen < minLen && oldText[commonPrefixLen] === newText[commonPrefixLen]) {
      commonPrefixLen++
    }

    const deleteCount = oldText.length - commonPrefixLen
    const insertText = newText.slice(commonPrefixLen)

    return { deleteCount, insertText }
  }

  /**
   * Checks the suffix for custom voice command phrases and executes keys or combos.
   */
  private async processStringWithCommands(text: string): Promise<void> {
    if (!this.options.voiceCommandsEnabled) {
      await keyboardService.typeText(text, this.options.typingSpeed)
      return
    }

    // Mapping voice command triggers to keyboard combos
    const commandsMap: { [key: string]: string } = {
      'new line': '~',
      'new paragraph': '~~',
      'tab key': '{TAB}',
      'delete last word': '^{BACKSPACE}',
      'undo last action': '^z',
      'redo last action': '^y',
      'select all': '^a',
      'copy text': '^c',
      'paste text': '^v'
    }

    const commandPhrases = Object.keys(commandsMap).map((c) =>
      c.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    )
    // Word boundary case-insensitive search
    const regex = new RegExp(`\\b(${commandPhrases.join('|')})\\b`, 'gi')

    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // Type prefix text prior to command
      const textSegment = text.slice(lastIndex, match.index)
      if (textSegment.length > 0) {
        await keyboardService.typeText(textSegment, this.options.typingSpeed)
      }

      const matchedCommand = match[0].toLowerCase()
      const commandCombo = commandsMap[matchedCommand]
      if (commandCombo) {
        logger.info(`InputEngine: Intercepted voice command: '${matchedCommand}'. Executing combo.`)
        await keyboardService.sendCombo(commandCombo)
      }

      lastIndex = regex.lastIndex
    }

    // Type remaining suffix
    const remainingText = text.slice(lastIndex)
    if (remainingText.length > 0) {
      await keyboardService.typeText(remainingText, this.options.typingSpeed)
    }
  }
}

export const inputEngine = new InputEngine()
