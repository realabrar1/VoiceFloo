import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Secure custom APIs exposed to the renderer
const api = {
  minimize: (): void => ipcRenderer.send('window-minimize'),
  maximize: (): void => ipcRenderer.send('window-maximize'),
  close: (): void => ipcRenderer.send('window-close'),
  notifyHideComplete: (): void => ipcRenderer.send('window-hide-complete'),

  // Listener subscriptions for main process events
  onWindowFadeIn: (callback: () => void): (() => void) => {
    const subscription = () => callback()
    ipcRenderer.on('window-fade-in', subscription)
    return () => {
      ipcRenderer.off('window-fade-in', subscription)
    }
  },

  onWindowFadeOut: (callback: () => void): (() => void) => {
    const subscription = () => callback()
    ipcRenderer.on('window-fade-out', subscription)
    return () => {
      ipcRenderer.off('window-fade-out', subscription)
    }
  },

  onOpenSettings: (callback: () => void): (() => void) => {
    const subscription = () => callback()
    ipcRenderer.on('window-open-settings', subscription)
    return () => {
      ipcRenderer.off('window-open-settings', subscription)
    }
  },

  // Auto-start setting invokes
  getStartupStatus: (): Promise<boolean> => ipcRenderer.invoke('startup-get-status'),
  toggleStartup: (enable: boolean): Promise<boolean> => ipcRenderer.invoke('startup-toggle', enable),
  openSystemSettings: (): void => ipcRenderer.send('open-system-settings'),

  // Whisper speech recognition endpoints
  getModelsList: (): Promise<any[]> => ipcRenderer.invoke('whisper-get-models'),
  isWhisperReady: (): Promise<boolean> => ipcRenderer.invoke('whisper-is-ready'),
  downloadModel: (modelId: string): Promise<boolean> => ipcRenderer.invoke('whisper-download-model', modelId),
  cancelDownload: (): void => ipcRenderer.send('whisper-cancel-download'),
  transcribeAudio: (sessionId: string, pcmBuffer: ArrayBuffer, options: any): Promise<string> => 
    ipcRenderer.invoke('whisper-transcribe', sessionId, pcmBuffer, options),
  cancelTranscription: (sessionId: string): void => ipcRenderer.send('whisper-cancel-transcription', sessionId),

  onDownloadProgress: (callback: (data: any) => void): (() => void) => {
    const subscription = (_event: any, data: any) => callback(data)
    ipcRenderer.on('download-progress', subscription)
    return () => {
      ipcRenderer.off('download-progress', subscription)
    }
  },

  onDownloadSuccess: (callback: (modelId: string) => void): (() => void) => {
    const subscription = (_event: any, modelId: string) => callback(modelId)
    ipcRenderer.on('download-success', subscription)
    return () => {
      ipcRenderer.off('download-success', subscription)
    }
  },

  onDownloadError: (callback: (errorMsg: string) => void): (() => void) => {
    const subscription = (_event: any, errorMsg: string) => callback(errorMsg)
    ipcRenderer.on('download-error', subscription)
    return () => {
      ipcRenderer.off('download-error', subscription)
    }
  },

  // Windows Input Engine preloads
  injectTextInput: (text: string, isFinal: boolean, targetPid?: number): Promise<boolean> =>
    ipcRenderer.invoke('input-inject-text', text, isFinal, targetPid),
  resetInputSession: (): void => ipcRenderer.send('input-reset-session'),
  getActiveWindow: (): Promise<any> => ipcRenderer.invoke('input-get-active-window'),
  setInputOptions: (options: any): void => ipcRenderer.send('input-set-options', options),

  // Global Shortcut preloads
  registerGlobalShortcut: (shortcutString: string): void =>
    ipcRenderer.send('shortcut-register', shortcutString),
  onGlobalShortcutPress: (callback: (win: any) => void): (() => void) => {
    const subscription = (_event: any, win: any) => callback(win)
    ipcRenderer.on('global-shortcut-press', subscription)
    return () => {
      ipcRenderer.off('global-shortcut-press', subscription)
    }
  },
  restore: (): void => ipcRenderer.send('window-restore'),
  setOverlayMode: (isOverlay: boolean): void => ipcRenderer.send('window-set-overlay', isOverlay),

  // Auto-update preloads
  checkForUpdates: (manual: boolean): Promise<boolean> => ipcRenderer.invoke('update-check', manual),
  downloadUpdate: (): Promise<boolean> => ipcRenderer.invoke('update-download'),
  installAndRestartUpdate: (): void => ipcRenderer.send('update-install-restart'),
  setUpdateSettings: (settings: any): void => ipcRenderer.send('update-set-settings', settings),

  onUpdateChecking: (callback: () => void): (() => void) => {
    const subscription = () => callback()
    ipcRenderer.on('update-checking', subscription)
    return () => {
      ipcRenderer.off('update-checking', subscription)
    }
  },

  onUpdateAvailable: (callback: (info: any) => void): (() => void) => {
    const subscription = (_event: any, info: any) => callback(info)
    ipcRenderer.on('update-available', subscription)
    return () => {
      ipcRenderer.off('update-available', subscription)
    }
  },

  onUpdateNotAvailable: (callback: (info: any) => void): (() => void) => {
    const subscription = (_event: any, info: any) => callback(info)
    ipcRenderer.on('update-not-available', subscription)
    return () => {
      ipcRenderer.off('update-not-available', subscription)
    }
  },

  onUpdateProgress: (callback: (progress: any) => void): (() => void) => {
    const subscription = (_event: any, progress: any) => callback(progress)
    ipcRenderer.on('update-progress', subscription)
    return () => {
      ipcRenderer.off('update-progress', subscription)
    }
  },

  onUpdateDownloaded: (callback: (info: any) => void): (() => void) => {
    const subscription = (_event: any, info: any) => callback(info)
    ipcRenderer.on('update-downloaded', subscription)
    return () => {
      ipcRenderer.off('update-downloaded', subscription)
    }
  },

  onUpdateError: (callback: (errorMsg: string) => void): (() => void) => {
    const subscription = (_event: any, errorMsg: string) => callback(errorMsg)
    ipcRenderer.on('update-error', subscription)
    return () => {
      ipcRenderer.off('update-error', subscription)
    }
  }
}

// Expose APIs if Context Isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose APIs in contextIsolated mode:', error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
