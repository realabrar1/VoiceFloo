import { ipcMain, BrowserWindow } from 'electron'

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    // Hide instead of close to run in tray background
    mainWindow.hide()
  })
}
