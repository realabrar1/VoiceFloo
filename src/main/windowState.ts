import { app, screen } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
}

export class WindowStateManager {
  private stateFilePath: string
  private state: WindowState

  constructor() {
    this.stateFilePath = join(app.getPath('userData'), 'window-state.json')
    this.state = this.loadState()
  }

  private loadState(): WindowState {
    const defaultWidth = 420
    const defaultHeight = 620

    // Get bottom-right position as default fallback
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea
    const fallbackX = screenWidth - defaultWidth - 24
    const fallbackY = screenHeight - defaultHeight - 24

    if (existsSync(this.stateFilePath)) {
      try {
        const data = JSON.parse(readFileSync(this.stateFilePath, 'utf-8'))
        // Validate coordinates are on-screen
        if (data.x !== undefined && data.y !== undefined) {
          const displays = screen.getAllDisplays()
          const isVisible = displays.some((display) => {
            const { x, y, width, height } = display.bounds
            return (
              data.x >= x &&
              data.x <= x + width &&
              data.y >= y &&
              data.y <= y + height
            )
          })
          if (isVisible) {
            return data
          }
        }
      } catch (e) {
        console.error('Failed to parse window state:', e)
      }
    }

    return {
      width: defaultWidth,
      height: defaultHeight,
      x: fallbackX,
      y: fallbackY
    }
  }

  public get x(): number | undefined {
    return this.state.x
  }

  public get y(): number | undefined {
    return this.state.y
  }

  public get width(): number {
    return this.state.width
  }

  public get height(): number {
    return this.state.height
  }

  public saveState(window: import('electron').BrowserWindow): void {
    if (window.isMinimized() || window.isMaximized()) {
      return
    }

    const bounds = window.getBounds()
    this.state = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    }

    try {
      writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2))
    } catch (e) {
      console.error('Failed to save window state:', e)
    }
  }
}
