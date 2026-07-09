import { app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { logger } from './services/logger.service'
import { WindowStateService } from './services/window-state.service'
import { WindowService } from './services/window.service'
import { trayService } from './services/tray.service'
import icon from '../../resources/icon.png?asset'

let windowService: WindowService | null = null

function initApp(): void {
  try {
    logger.info('Initializing VoiceFloo services...')

    // Initialize state service and window manager
    const stateService = new WindowStateService()
    windowService = new WindowService(stateService)

    // Build the window
    windowService.createWindow(icon)

    // Setup native system tray
    trayService.createTray(
      icon,
      // Left click toggle handler
      () => {
        if (windowService) windowService.toggle()
      },
      // Restart application handler
      () => {
        logger.info('Relaunching application...')
        app.relaunch()
        app.exit(0)
      },
      // Open settings panel handler
      () => {
        if (windowService) windowService.openSettings()
      }
    )
  } catch (err) {
    logger.error('Failed during app service initialization', err)
  }
}

// Single Instance Lock: ensure only one VoiceFloo copy runs at a time
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  logger.info('Another instance of VoiceFloo is already running. Terminating.')
  app.quit()
} else {
  app.on('second-instance', () => {
    logger.info('Second instance invocation detected. Bringing window to focus.')
    if (windowService) {
      windowService.show()
    }
  })

  app.whenReady().then(() => {
    // Set App User Model ID (required for Windows toast notifications)
    electronApp.setAppUserModelId('com.voicefloo.app')

    // Standard dev shortcuts watcher
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    initApp()

    app.on('activate', () => {
      if (windowService && !windowService.getWindow()) {
        initApp()
      } else if (windowService) {
        windowService.show()
      }
    })
  })
}

// Override default window-all-closed behavior
app.on('window-all-closed', () => {
  logger.info('All windows closed event fired.')
  // Floating utilities run in background via tray icon,
  // we do not quit here unless explicit shutdown is requested.
  if (process.platform === 'darwin') {
    // On macOS, apps generally remain active in memory
    logger.info('Application kept active in memory (macOS standard).')
  }
})

// Will quit cleanup hook
app.on('will-quit', () => {
  trayService.destroy()
  logger.info('VoiceFloo shutdown completed.')
})
