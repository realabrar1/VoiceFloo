import { app } from 'electron'
import { logger } from './logger.service'

export class StartupService {
  /**
   * Check if auto-start is currently enabled in settings.
   */
  public isEnabled(): boolean {
    try {
      // For development, app.getPath('exe') might point to node/electron.exe.
      // That's fine, Electron handles standard packaging mappings automatically.
      const settings = app.getLoginItemSettings()
      logger.info(`Checked auto-start status: ${settings.openAtLogin}`)
      return settings.openAtLogin
    } catch (err) {
      logger.error('Failed to read auto-start login settings', err)
      return false
    }
  }

  /**
   * Enable auto-start on user login.
   */
  public enable(): boolean {
    try {
      app.setLoginItemSettings({
        openAtLogin: true,
        // On Windows, you can optionally specify the executable path
        path: app.getPath('exe'),
        args: ['--hidden'] // Custom flag to launch hidden in system tray
      })
      logger.info('Auto-start at system login successfully enabled.')
      return true
    } catch (err) {
      logger.error('Failed to enable auto-start at login', err)
      return false
    }
  }

  /**
   * Disable auto-start on user login.
   */
  public disable(): boolean {
    try {
      app.setLoginItemSettings({
        openAtLogin: false
      })
      logger.info('Auto-start at system login successfully disabled.')
      return true
    } catch (err) {
      logger.error('Failed to disable auto-start at login', err)
      return false
    }
  }
}

export const startupService = new StartupService()
