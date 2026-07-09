import { app, Tray, Menu, BrowserWindow } from 'electron'

export function createTray(mainWindow: BrowserWindow, iconPath: string): Tray {
  const tray = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show VoiceFloo',
      click: (): void => {
        mainWindow.show()
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.focus()
      }
    },
    {
      label: 'Hide VoiceFloo',
      click: (): void => {
        mainWindow.hide()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: (): void => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('VoiceFloo')
  tray.setContextMenu(contextMenu)

  // Toggle on double click
  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })

  return tray
}
