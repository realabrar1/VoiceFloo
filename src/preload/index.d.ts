import { ElectronAPI } from '@electron-toolkit/preload'

export interface AppAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  notifyHideComplete: () => void
  onWindowFadeIn: (callback: () => void) => () => void
  onWindowFadeOut: (callback: () => void) => () => void
  onOpenSettings: (callback: () => void) => () => void
  getStartupStatus: () => Promise<boolean>
  toggleStartup: (enable: boolean) => Promise<boolean>
  openSystemSettings: () => void
  getModelsList: () => Promise<any[]>
  isWhisperReady: () => Promise<boolean>
  downloadModel: (modelId: string) => Promise<boolean>
  cancelDownload: () => void
  transcribeAudio: (sessionId: string, pcmBuffer: ArrayBuffer, options: any) => Promise<string>
  cancelTranscription: (sessionId: string) => void
  onDownloadProgress: (callback: (data: any) => void) => () => void
  onDownloadSuccess: (callback: (modelId: string) => void) => () => void
  onDownloadError: (callback: (errorMsg: string) => void) => () => void
  injectTextInput: (text: string, isFinal: boolean) => Promise<boolean>
  resetInputSession: () => void
  getActiveWindow: () => Promise<any>
  setInputOptions: (options: any) => void
  checkForUpdates: (manual: boolean) => Promise<boolean>
  downloadUpdate: () => Promise<boolean>
  installAndRestartUpdate: () => void
  setUpdateSettings: (settings: any) => void
  onUpdateChecking: (callback: () => void) => () => void
  onUpdateAvailable: (callback: (info: any) => void) => () => void
  onUpdateNotAvailable: (callback: (info: any) => void) => () => void
  onUpdateProgress: (callback: (progress: any) => void) => () => void
  onUpdateDownloaded: (callback: (info: any) => void) => () => void
  onUpdateError: (callback: (errorMsg: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppAPI
  }
}
