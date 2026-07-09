import { app, Tray, Menu } from 'electron'
import { logger } from './logger.service'

export class TrayService {
  private tray: Tray | null = null

  public createTray(
    iconPath: string,
    onToggle: () => void,
    onRestart: () => void,
    onSettings: () => void
  ): Tray {
    try {
      this.tray = new Tray(iconPath)

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open VoiceFloo',
          click: () => {
            logger.info('Tray menu: "Open VoiceFloo" clicked')
            onToggle()
          }
        },
        { type: 'separator' },
        {
          label: 'Start Recording (placeholder)',
          enabled: false
        },
        {
          label: 'Pause Recording (placeholder)',
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => {
            logger.info('Tray menu: "Settings" clicked')
            onSettings()
          }
        },
        {
          label: 'Check for Updates (placeholder)',
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Restart',
          click: () => {
            logger.info('Tray menu: "Restart" clicked')
            onRestart()
          }
        },
        {
          label: 'Quit VoiceFloo',
          click: () => {
            logger.info('Tray menu: "Quit VoiceFloo" clicked')
            app.quit()
          }
        }
      ])

      this.tray.setToolTip('VoiceFloo')
      this.tray.setContextMenu(contextMenu)

      // Left click toggle
      this.tray.on('click', () => {
        logger.info('System tray icon left-clicked')
        onToggle()
      })

      logger.info('System tray successfully initialized')
      return this.tray
    } catch (err) {
      logger.error('Failed to create system tray', err)
      throw err
    }
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
      logger.info('System tray destroyed')
    }
  }
}

export const trayService = new TrayService()
