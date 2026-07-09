import { app, BrowserWindow } from 'electron'
import { existsSync, mkdirSync, unlinkSync, createWriteStream, statSync } from 'fs'
import { join } from 'path'
import * as https from 'https'
import { logger } from './logger.service'

export interface ModelInfo {
  name: string
  id: string
  size: string
  ramUsage: string
  estimatedSpeed: string
  languageSupport: string
  downloadUrl: string
  installed: boolean
  minSizeBytes: number // For basic checksum verification
}

export class ModelManager {
  private modelsDir: string
  private isDownloading: boolean = false
  private activeDownloadRequest: any = null

  // Predefined Whisper GGML models
  private models: ModelInfo[] = [
    {
      name: 'Tiny Model',
      id: 'tiny',
      size: '75 MB',
      ramUsage: '~150 MB',
      estimatedSpeed: 'Fastest',
      languageSupport: 'Multilingual',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
      installed: false,
      minSizeBytes: 70 * 1024 * 1024 // ~75MB
    },
    {
      name: 'Base Model (Recommended)',
      id: 'base',
      size: '140 MB',
      ramUsage: '~250 MB',
      estimatedSpeed: 'Fast',
      languageSupport: 'Multilingual',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
      installed: false,
      minSizeBytes: 135 * 1024 * 1024 // ~140MB
    },
    {
      name: 'Small Model',
      id: 'small',
      size: '460 MB',
      ramUsage: '~600 MB',
      estimatedSpeed: 'Moderate',
      languageSupport: 'Multilingual',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
      installed: false,
      minSizeBytes: 450 * 1024 * 1024 // ~460MB
    },
    {
      name: 'Medium Model',
      id: 'medium',
      size: '1.5 GB',
      ramUsage: '~1.5 GB',
      estimatedSpeed: 'Slow',
      languageSupport: 'Multilingual',
      downloadUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin',
      installed: false,
      minSizeBytes: 1400 * 1024 * 1024 // ~1.5GB
    }
  ]

  constructor() {
    this.modelsDir = join(app.getPath('userData'), 'models')

    // Ensure models folder exists
    if (!existsSync(this.modelsDir)) mkdirSync(this.modelsDir, { recursive: true })

    this.checkInstalledModels()
  }

  public getModelsDir(): string {
    return this.modelsDir
  }

  private getWhisperBinPath(): string {
    if (app.isPackaged) {
      return join(process.resourcesPath, 'whisper')
    }
    return join(app.getAppPath(), 'resources', 'whisper')
  }

  public getWhisperExecutablePath(): string {
    return join(this.getWhisperBinPath(), 'whisper-cli.exe')
  }

  public getModelPath(modelId: string): string {
    return join(this.modelsDir, `ggml-${modelId}.bin`)
  }

  public isWhisperInstalled(): boolean {
    return existsSync(this.getWhisperExecutablePath())
  }

  public getModelsList(): ModelInfo[] {
    this.checkInstalledModels()
    return this.models
  }

  /**
   * Refreshes installed states of pre-defined models.
   */
  public checkInstalledModels(): void {
    this.models = this.models.map((model) => {
      const modelPath = this.getModelPath(model.id)
      return {
        ...model,
        installed: existsSync(modelPath)
      }
    })
  }

  /**
   * Download the selected whisper.cpp model file.
   */
  public async downloadModel(modelId: string, window: BrowserWindow): Promise<void> {
    if (this.isDownloading) {
      throw new Error('Another download task is already running.')
    }
    this.isDownloading = true

    try {
      // 1. Verify bundled binary exists
      if (!this.isWhisperInstalled()) {
        throw new Error('Whisper speech engine binary was not found in application resources.')
      }

      // 2. Download model bin
      const targetModel = this.models.find(m => m.id === modelId)
      if (!targetModel) {
        throw new Error(`Model parameter '${modelId}' is not supported.`)
      }

      const modelPath = this.getModelPath(modelId)
      if (!existsSync(modelPath)) {
        logger.info(`ModelManager: Commencing download for ${targetModel.name}...`)
        await this.downloadFile(targetModel.downloadUrl, modelPath, 'model', window)

        // Basic checksum size validation
        const stats = statSync(modelPath)
        if (stats.size < targetModel.minSizeBytes) {
          try { unlinkSync(modelPath) } catch {}
          throw new Error('Model checksum verification failed. The downloaded file is incomplete.')
        }
        logger.info(`ModelManager: Model ${targetModel.name} successfully installed & verified.`)
      } else {
        logger.info(`ModelManager: Model ${targetModel.name} already installed.`)
      }

      this.checkInstalledModels()
      window.webContents.send('download-success', modelId)
    } catch (err: any) {
      logger.error(`ModelManager: Download task failed: ${err.message}`)
      window.webContents.send('download-error', err.message)
      throw err
    } finally {
      this.isDownloading = false
    }
  }

  /**
   * Cancel active HTTP streams.
   */
  public cancelDownload(): void {
    if (this.activeDownloadRequest) {
      this.activeDownloadRequest.destroy()
      this.activeDownloadRequest = null
      this.isDownloading = false
      logger.info('ModelManager: Active download aborted by user request.')
    }
  }

  /**
   * Custom HTTPS file downloader supporting redirect handshakes.
   */
  private downloadFile(
    fileUrl: string,
    outputPath: string,
    type: 'binary' | 'model',
    window: BrowserWindow
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const executeDownload = (url: string) => {
        this.activeDownloadRequest = https.get(url, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
            const redirect = res.headers.location
            if (redirect) {
              executeDownload(redirect)
              return
            }
          }

          if (res.statusCode !== 200) {
            reject(new Error(`Server returned HTTP ${res.statusCode}`))
            return
          }

          const total = parseInt(res.headers['content-length'] || '0', 10)
          let loaded = 0

          const stream = createWriteStream(outputPath)
          res.pipe(stream)

          res.on('data', (chunk) => {
            loaded += chunk.length
            if (total > 0) {
              const percent = Math.round((loaded / total) * 100)
              window.webContents.send('download-progress', { type, percent, loaded, total })
            }
          })

          stream.on('finish', () => {
            stream.close()
            resolve()
          })

          stream.on('error', (err) => {
            stream.close()
            try { unlinkSync(outputPath) } catch {}
            reject(err)
          })
        })

        this.activeDownloadRequest.on('error', (err: any) => {
          try { unlinkSync(outputPath) } catch {}
          reject(err)
        })
      }

      executeDownload(fileUrl)
    })
  }

}

export const modelManager = new ModelManager()
