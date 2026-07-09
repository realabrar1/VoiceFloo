import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'
import { logger } from './logger.service'

export interface UpdateSettings {
  autoCheck: boolean
  autoDownload: boolean
  channel: 'stable' | 'beta' | 'dev'
}

export class UpdateService {
  private mainWindow: BrowserWindow | null = null
  private settings: UpdateSettings = {
    autoCheck: true,
    autoDownload: false,
    channel: 'stable'
  }

  /**
   * Initializes updater events and binds to the main application window target.
   */
  public initialize(window: BrowserWindow): void {
    this.mainWindow = window

    // Sync updater configurations
    autoUpdater.autoDownload = this.settings.autoDownload
    autoUpdater.allowPrerelease = this.settings.channel !== 'stable'
    if (this.settings.channel === 'dev') {
      autoUpdater.allowDowngrade = true
    }

    autoUpdater.logger = logger

    // Bind event hooks
    autoUpdater.on('checking-for-update', () => {
      logger.info('UpdateService: Checking for updates...')
      this.emitToWindow('update-checking')
    })

    autoUpdater.on('update-available', (info) => {
      logger.info(`UpdateService: Update version ${info.version} is available.`)
      this.emitToWindow('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      })
    })

    autoUpdater.on('update-not-available', (info) => {
      logger.info(`UpdateService: No new updates. Current version is up to date: ${info.version}`)
      this.emitToWindow('update-not-available', {
        version: info.version
      })
    })

    autoUpdater.on('download-progress', (progressObj) => {
      this.emitToWindow('update-progress', {
        percent: Math.round(progressObj.percent),
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      logger.info(`UpdateService: Update version ${info.version} downloaded successfully.`)
      this.emitToWindow('update-downloaded', {
        version: info.version
      })
    })

    autoUpdater.on('error', (err) => {
      logger.error(`UpdateService: Auto update check error: ${err.message}`)
      this.emitToWindow('update-error', err.message)
    })

    // Run background automatic checker on startup if enabled
    if (this.settings.autoCheck) {
      setTimeout(() => {
        this.checkForUpdates(false)
      }, 6000)
    }
  }

  /**
   * Triggers an update check manual or automatic.
   */
  public async checkForUpdates(manual: boolean = false): Promise<void> {
    try {
      logger.info(`UpdateService: Checking for updates. Manual check: ${manual}`)
      await autoUpdater.checkForUpdates()
    } catch (err: any) {
      logger.error(`UpdateService: Failed to query updates: ${err.message}`)
      if (manual) {
        this.emitToWindow('update-error', `Update check failed: ${err.message}`)
      }
    }
  }

  /**
   * Forces downloader to fetch release assets.
   */
  public async downloadUpdate(): Promise<void> {
    try {
      logger.info('UpdateService: Downloading update binaries...')
      await autoUpdater.downloadUpdate()
    } catch (err: any) {
      logger.error(`UpdateService: Download failed: ${err.message}`)
      this.emitToWindow('update-error', `Download failed: ${err.message}`)
    }
  }

  /**
   * Install and restart application.
   */
  public installAndRestart(): void {
    logger.info('UpdateService: Installing and restarting...')
    autoUpdater.quitAndInstall()
  }

  /**
   * Sync settings configurations.
   */
  public setSettings(opts: Partial<UpdateSettings>): void {
    this.settings = { ...this.settings, ...opts }
    
    autoUpdater.autoDownload = this.settings.autoDownload
    autoUpdater.allowPrerelease = this.settings.channel !== 'stable'
    
    logger.info(`UpdateService: Config options synchronized: ${JSON.stringify(this.settings)}`)
  }

  private emitToWindow(channel: string, ...args: any[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args)
    }
  }
}

export const updateService = new UpdateService()
