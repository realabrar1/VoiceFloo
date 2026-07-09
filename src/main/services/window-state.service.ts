import { app, screen } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { logger } from './logger.service'

export interface WindowGeometry {
  width: number
  height: number
  x?: number
  y?: number
}

export class WindowStateService {
  private stateFilePath: string
  private state: WindowGeometry

  constructor() {
    this.stateFilePath = join(app.getPath('userData'), 'window-state.json')
    this.state = this.loadState()
  }

  private loadState(): WindowGeometry {
    const defaultWidth = 420
    const defaultHeight = 620

    // Compute standard bottom-right position as fallback
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea
    const fallbackX = screenWidth - defaultWidth - 24
    const fallbackY = screenHeight - defaultHeight - 24

    if (existsSync(this.stateFilePath)) {
      try {
        const fileContent = readFileSync(this.stateFilePath, 'utf-8')
        const data = JSON.parse(fileContent) as WindowGeometry
        
        // Ensure values exist
        if (data.x !== undefined && data.y !== undefined) {
          const displays = screen.getAllDisplays()
          // Validate position is inside the boundaries of one of the active displays
          const isPositionOnScreen = displays.some((display) => {
            const { x, y, width, height } = display.bounds
            // Allow some wiggle room, but verify the coordinate lands inside
            return (
              data.x! >= x &&
              data.x! < x + width &&
              data.y! >= y &&
              data.y! < y + height
            )
          })

          if (isPositionOnScreen) {
            logger.info(`Loaded valid window geometry from state: ${data.width}x${data.height} at (${data.x}, ${data.y})`)
            return data
          } else {
            logger.info('Saved window geometry is off-screen. Resetting to default coordinates.')
          }
        }
      } catch (err) {
        logger.error('Failed to parse window state file, falling back to defaults', err)
      }
    }

    logger.info(`Using default bottom-right coordinates: ${defaultWidth}x${defaultHeight} at (${fallbackX}, ${fallbackY})`)
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
    try {
      if (window.isDestroyed() || window.isMinimized() || window.isMaximized()) {
        return
      }

      const bounds = window.getBounds()
      this.state = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y
      }

      writeFileSync(this.stateFilePath, JSON.stringify(this.state, null, 2), 'utf-8')
    } catch (err) {
      logger.error('Failed to write window state file', err)
    }
  }
}
