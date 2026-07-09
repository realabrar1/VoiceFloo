import { BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { logger } from './logger.service'
import { WindowStateService } from './window-state.service'
import { startupService } from './startup.service'
import { modelManager } from './model.manager'
import { whisperService } from './whisper.service'
import { inputEngine } from './input.engine'
import { focusedWindowService } from './focused-window.service'
import { updateService } from './update.service'

export class WindowService {
  private window: BrowserWindow | null = null
  private stateService: WindowStateService

  constructor(stateService: WindowStateService) {
    this.stateService = stateService
    this.registerIpcHandlers()
  }

  public getWindow(): BrowserWindow | null {
    return this.window
  }

  /**
   * Create the application window with custom frame settings.
   */
  public createWindow(iconPath: string): BrowserWindow {
    try {
      this.window = new BrowserWindow({
        width: this.stateService.width,
        height: this.stateService.height,
        x: this.stateService.x,
        y: this.stateService.y,
        minWidth: 380,
        minHeight: 520,
        show: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        hasShadow: true,
        autoHideMenuBar: true,
        titleBarStyle: 'customButtonsOnHover',
        ...(process.platform === 'linux' ? { icon: iconPath } : {}),
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false,
          nodeIntegration: false,
          contextIsolation: true,
          backgroundThrottling: false
        }
      })

      // Show when ready, triggering fade-in in renderer
      this.window.on('ready-to-show', () => {
        logger.info('Window ready-to-show event fired. Triggering show.')
        this.show()
      })

      // Track window moves and resizes
      this.window.on('move', () => {
        if (this.window) this.stateService.saveState(this.window)
      })

      this.window.on('resize', () => {
        if (this.window) this.stateService.saveState(this.window)
      })

      // Skip taskbar when minimized
      this.window.on('minimize', () => {
        if (this.window) {
          this.window.setSkipTaskbar(true)
          logger.info('Window minimized - skipped taskbar')
        }
      })

      this.window.on('restore', () => {
        if (this.window) {
          this.window.setSkipTaskbar(false)
          logger.info('Window restored')
        }
      })

      // Prevent window navigations
      this.window.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
      })

      // Load URL / files
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        this.window.loadURL(process.env['ELECTRON_RENDERER_URL'])
      } else {
        this.window.loadFile(join(__dirname, '../renderer/index.html'))
      }

      // Initialize the auto-update pipeline on the window target
      updateService.initialize(this.window)

      logger.info('BrowserWindow successfully created.')
      return this.window
    } catch (err) {
      logger.error('Failed to create BrowserWindow', err)
      throw err
    }
  }

  /**
   * Show the window and trigger the React fade-in transition.
   */
  public show(): void {
    if (!this.window) return

    if (!this.window.isVisible()) {
      this.window.show()
    }

    if (this.window.isMinimized()) {
      this.window.restore()
    }

    this.window.focus()
    logger.info('Window shown and focused. Sending window-fade-in.')

    // Notify React to run fade-in
    this.window.webContents.send('window-fade-in')
  }

  /**
   * Request window to hide, giving the React renderer time to fade-out first.
   */
  public hide(): void {
    if (!this.window) return
    logger.info('Sending window-fade-out request to renderer.')
    this.window.webContents.send('window-fade-out')
  }

  /**
   * Physical hide action executed when the renderer confirms transition completion.
   */
  public forceHide(): void {
    if (this.window && this.window.isVisible()) {
      this.window.hide()
      logger.info('Window native visibility set to hidden.')
    }
  }

  /**
   * Toggle the window visibility state.
   */
  public toggle(): void {
    if (!this.window) return
    if (this.window.isVisible()) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * Center the window.
   */
  public center(): void {
    if (this.window) {
      this.window.center()
      logger.info('Window centered.')
    }
  }

  /**
   * Focus the window.
   */
  public focus(): void {
    if (this.window) {
      this.window.focus()
      logger.info('Window focused.')
    }
  }

  /**
   * Set settings panel trigger in React.
   */
  public openSettings(): void {
    if (!this.window) return
    this.show()
    this.window.webContents.send('window-open-settings')
    logger.info('Sent settings overlay open command to renderer.')
  }

  /**
   * Setup IPC handlers for window layout control and auto-start management.
   */
  private registerIpcHandlers(): void {
    // Window control IPCs
    ipcMain.on('window-minimize', () => {
      if (this.window) this.window.minimize()
    })

    ipcMain.on('window-maximize', () => {
      if (!this.window) return
      if (this.window.isMaximized()) {
        this.window.unmaximize()
      } else {
        this.window.maximize()
      }
    })

    ipcMain.on('window-close', () => {
      this.hide()
    })

    ipcMain.on('window-hide-complete', () => {
      this.forceHide()
    })

    ipcMain.on('open-system-settings', () => {
      const platform = process.platform
      if (platform === 'win32') {
        shell.openExternal('ms-settings:privacy-microphone')
      } else if (platform === 'darwin') {
        shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone')
      } else {
        shell.openExternal('https://support.google.com/chrome/answer/2693767')
      }
    })

    // Auto-start settings IPC handlers
    ipcMain.handle('startup-get-status', () => {
      return startupService.isEnabled()
    })

    ipcMain.handle('startup-toggle', (_, enable: boolean) => {
      return enable ? startupService.enable() : startupService.disable()
    })

    // Whisper speech recognition IPC handlers
    ipcMain.handle('whisper-get-models', () => {
      return modelManager.getModelsList()
    })

    ipcMain.handle('whisper-is-ready', () => {
      return modelManager.isWhisperInstalled() && modelManager.getModelsList().some(m => m.installed)
    })

    ipcMain.handle('whisper-download-model', async (_event, modelId: string) => {
      if (!this.window) throw new Error('No window target registered')
      await modelManager.downloadModel(modelId, this.window)
      return true
    })

    ipcMain.on('whisper-cancel-download', () => {
      modelManager.cancelDownload()
    })

    ipcMain.handle('whisper-transcribe', async (_event, sessionId: string, pcmBuffer: any, options: any) => {
      const pcmSamples = Buffer.isBuffer(pcmBuffer)
        ? new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.byteLength / 2)
        : new Int16Array(pcmBuffer)
      return whisperService.transcribe(sessionId, pcmSamples, options)
    })

    ipcMain.on('whisper-cancel-transcription', (_event, sessionId: string) => {
      whisperService.cancel(sessionId)
    })

    // Windows Input Engine IPC handlers
    ipcMain.handle('input-inject-text', async (_event, text: string, isFinal: boolean) => {
      await inputEngine.handleInput(text, isFinal)
      return true
    })

    ipcMain.on('input-reset-session', () => {
      inputEngine.resetSession()
    })

    ipcMain.handle('input-get-active-window', async () => {
      return focusedWindowService.getFocusedWindow()
    })

    ipcMain.on('input-set-options', (_event, options: any) => {
      inputEngine.setOptions(options)
    })

    // Auto-update IPC handlers
    ipcMain.handle('update-check', async (_event, manual: boolean) => {
      await updateService.checkForUpdates(manual)
      return true
    })

    ipcMain.handle('update-download', async () => {
      await updateService.downloadUpdate()
      return true
    })

    ipcMain.on('update-install-restart', () => {
      updateService.installAndRestart()
    })

    ipcMain.on('update-set-settings', (_event, settings: any) => {
      updateService.setSettings(settings)
    })
  }
}
