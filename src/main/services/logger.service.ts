import { app } from 'electron'
import { join } from 'path'
import { appendFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

export class LoggerService {
  private logFilePath: string

  constructor() {
    try {
      const logsDir = join(app.getPath('userData'), 'logs')
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true })
      }
      this.logFilePath = join(logsDir, 'app.log')
      
      // Initialize log file if not exists
      if (!existsSync(this.logFilePath)) {
        writeFileSync(this.logFilePath, this.formatMessage('INFO', 'Log file initialized.'), 'utf-8')
      }
    } catch (err) {
      console.error('Failed to initialize LoggerService:', err)
      // Fallback path inside the workspace if app.getPath fails (e.g. before app ready)
      this.logFilePath = join(process.cwd(), 'app-fallback.log')
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] ${message}\n`
  }

  public info(message: string): void {
    const msg = this.formatMessage('INFO', message)
    console.log(msg.trim())
    try {
      appendFileSync(this.logFilePath, msg, 'utf-8')
    } catch (err) {
      console.error('Failed to write info log:', err)
    }
  }

  public warn(message: string): void {
    const msg = this.formatMessage('WARN', message)
    console.warn(msg.trim())
    try {
      appendFileSync(this.logFilePath, msg, 'utf-8')
    } catch (err) {
      console.error('Failed to write warn log:', err)
    }
  }

  public error(message: string, error?: any): void {
    const errorDetail = error 
      ? ` - Error: ${error.stack || error.message || JSON.stringify(error)}` 
      : ''
    const msg = this.formatMessage('ERROR', `${message}${errorDetail}`)
    console.error(msg.trim())
    try {
      appendFileSync(this.logFilePath, msg, 'utf-8')
    } catch (err) {
      console.error('Failed to write error log:', err)
    }
  }
}

export const logger = new LoggerService()
