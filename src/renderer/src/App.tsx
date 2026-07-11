import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Play, Pause, AlertCircle, Check, X, RefreshCw, Globe, Mic, Keyboard, Download, Info } from 'lucide-react'

// Import the Audio Engine orchestrator and types
import { audioEngine } from './services/audio/audio-engine'
import { AudioInputDevice } from './services/audio/audio-device-manager'

// Import the Speech Engine orchestrator
import { speechEngine } from './services/speech/speech-engine'

interface OverlayWaveformProps {
  level: number
  isPaused: boolean
}

const OverlayWaveform: React.FC<OverlayWaveformProps> = ({ level, isPaused }) => {
  const barCount = 38
  const [heights, setHeights] = useState<number[]>(new Array(barCount).fill(4))

  useEffect(() => {
    if (isPaused) {
      setHeights(new Array(barCount).fill(4))
      return
    }

    const interval = setInterval(() => {
      setHeights(() => {
        return Array.from({ length: barCount }).map((_, i) => {
          const factor = Math.sin((i / (barCount - 1)) * Math.PI)
          const randomFactor = 0.3 + Math.random() * 0.7
          
          // Animate height dynamically based on mic level, with a baseline animation
          const targetHeight = 4 + (level > 0.005 ? level * 80 : Math.sin(Date.now() * 0.008 + i * 0.4) * 8) * factor * randomFactor
          
          return Math.max(4, Math.min(32, targetHeight))
        })
      })
    }, 20)

    return () => clearInterval(interval)
  }, [level, isPaused])

  return (
    <div className="flex items-center justify-center gap-[4px] h-9 px-2 w-[220px] overflow-hidden select-none">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full bg-gradient-to-t from-blue-500 to-cyan-400"
          animate={{ height: h }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        />
      ))}
    </div>
  )
}

function App(): React.JSX.Element {
  // Application and audio state
  const [micState, setMicState] = useState<'idle' | 'recording' | 'paused' | 'error' | 'processing' | 'success'>('idle')
  const [liveLevel, setLiveLevel] = useState(0)

  // Speech engine model states
  const [isWhisperReady, setIsWhisperReady] = useState(true)
  const [modelsList, setModelsList] = useState<any[]>([])
  const [wizardModelId, setWizardModelId] = useState('base')
  const [downloadState, setDownloadState] = useState({
    isDownloading: false,
    type: 'model',
    percent: 0
  })

  // Device lists
  const [devicesList, setDevicesList] = useState<AudioInputDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('default')

  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [showPermissionError, setShowPermissionError] = useState(false)

  // Settings states
  const [shortcut, setShortcut] = useState(() => {
    return localStorage.getItem('voicefloo-shortcut') || 'Alt + Space'
  })
  const [language, setLanguage] = useState('EN')

  // Auto-update states
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error'>('idle')
  const [updateProgress, setUpdateProgress] = useState(0)

  // Window references to track keyboard injection targets
  const [targetWindow, setTargetWindow] = useState<{ pid: number; executable: string; title: string } | null>(null)
  const targetWindowRef = React.useRef<{ pid: number; executable: string; title: string } | null>(null)
  const handleMicClickRef = React.useRef<any>(null)
  targetWindowRef.current = targetWindow

  // Visual transitions state
  const [isRendered, setIsRendered] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Dynamic global shortcut synchronization
  useEffect(() => {
    window.api.registerGlobalShortcut(shortcut)
    localStorage.setItem('voicefloo-shortcut', shortcut)
  }, [shortcut])

  // System status and options defaults
  useEffect(() => {
    window.api.setInputOptions({
      strategy: 'auto',
      typingSpeed: 0,
      autoRestoreClipboard: true,
      delayBeforeTyping: 50,
      voiceCommandsEnabled: true
    })
  }, [])

  // Initialization and IPC listeners binding
  useEffect(() => {
    const removeFadeIn = window.api.onWindowFadeIn(() => {
      setIsFadingOut(false)
      setIsRendered(true)
    })

    const removeFadeOut = window.api.onWindowFadeOut(() => {
      setIsFadingOut(true)
    })

    const removeOpenSettings = window.api.onOpenSettings(() => {
      setShowSettings(true)
    })

    const removeDownloadProgress = window.api.onDownloadProgress((data) => {
      setDownloadState({
        isDownloading: true,
        type: data.type,
        percent: data.percent
      })
    })

    const handleDownloadSuccess = (modelId: string) => {
      setDownloadState({ isDownloading: false, type: 'model', percent: 100 })
      setIsWhisperReady(true)
      setWizardModelId(modelId)
      window.api.getModelsList().then((list) => setModelsList(list))
    }
    const unsubSuccess = window.api.onDownloadSuccess(handleDownloadSuccess)

    // Audio Engine hooks
    const handleDeviceChanged = (deviceId: string) => {
      setSelectedDeviceId(deviceId)
      setDevicesList(audioEngine.devices.getDevices())
    }

    const handleDevicesUpdated = (list: AudioInputDevice[]) => {
      setDevicesList(list)
    }

    const handleTranscriptUpdated = (text: string) => {
      window.api.injectTextInput(text, false, targetWindowRef.current?.pid)
    }

    audioEngine.events.on('AudioLevelChanged', (level: number) => setLiveLevel(level))
    audioEngine.events.on('PermissionDenied', () => { setShowPermissionError(true); setMicState('error') })
    audioEngine.events.on('DeviceChanged', handleDeviceChanged)
    audioEngine.events.on('DevicesUpdated', handleDevicesUpdated)
    audioEngine.events.on('TranscriptUpdated', handleTranscriptUpdated)

    const removeGlobalShortcutPress = window.api.onGlobalShortcutPress((win) => {
      if (handleMicClickRef.current) {
        handleMicClickRef.current(win)
      }
    })

    // Auto-update IPC bindings
    const unsubChecking = window.api.onUpdateChecking(() => setUpdateStatus('checking'))
    const unsubAvailable = window.api.onUpdateAvailable(() => setUpdateStatus('available'))
    const unsubNotAvailable = window.api.onUpdateNotAvailable(() => setUpdateStatus('idle'))
    const unsubProgress = (progress: any) => {
      setUpdateStatus('downloading')
      setUpdateProgress(Math.round(progress.percent))
    }
    const unsubUpdateProgress = window.api.onUpdateProgress(unsubProgress)
    const unsubDownloaded = window.api.onUpdateDownloaded(() => setUpdateStatus('ready'))
    const unsubError = window.api.onUpdateError(() => setUpdateStatus('error'))

    return () => {
      removeFadeIn()
      removeFadeOut()
      removeOpenSettings()
      removeDownloadProgress()
      unsubSuccess()
      removeGlobalShortcutPress()
      unsubChecking()
      unsubAvailable()
      unsubNotAvailable()
      unsubUpdateProgress()
      unsubDownloaded()
      unsubError()
      audioEngine.events.off('TranscriptUpdated', handleTranscriptUpdated)
    }
  }, [])

  // Sync Settings window
  useEffect(() => {
    if (showSettings) {
      window.api.getModelsList().then((list) => {
        setModelsList(list)
        const active = list.find(m => m.installed)
        if (active) {
          setWizardModelId(active.id)
        }
      })
      audioEngine.devices.refreshDevices().then((list) => {
        setDevicesList(list)
      })
    }
  }, [showSettings])

  // Sync SpeechEngine inference parameters
  useEffect(() => {
    const active = modelsList.find(m => m.installed)
    speechEngine.setOptions({
      modelId: active ? active.id : 'base',
      language: language.toLowerCase() === 'auto' ? 'auto' : language.toLowerCase(),
      threads: 4,
      vadEnabled: true
    })
  }, [modelsList, language])

  // Model Manager triggers
  const handleStartModelDownload = async () => {
    try {
      setDownloadState({ isDownloading: true, type: 'model', percent: 0 })
      await window.api.downloadModel(wizardModelId)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancelDownload = () => {
    window.api.cancelDownload()
    setDownloadState({ isDownloading: false, type: 'model', percent: 0 })
  }

  const handleDeviceSelect = async (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    await audioEngine.devices.selectDevice(deviceId)
  }

  const handlePauseRecording = () => {
    audioEngine.pauseRecording()
    speechEngine.pauseRecording()
    setMicState('paused')
  }

  const handleResumeRecording = () => {
    audioEngine.resumeRecording()
    speechEngine.resumeRecording()
    setMicState('recording')
  }

  const handleCancelRecording = () => {
    audioEngine.cancelRecording()
    speechEngine.cancelSession()
    setMicState('idle')
    window.api.setOverlayMode(false)
    window.api.close()
  }

  const handleRetryPermission = async () => {
    setShowPermissionError(false)
    setMicState('idle')
    await handleMicClick()
  }

  const handleMicClick = async (win?: any) => {
    if (!isWhisperReady) return
    if (micState === 'idle' || micState === 'error') {
      try {
        setLiveLevel(0)
        setTargetWindow(null)
        window.api.resetInputSession()
        
        let activeWin = win || await window.api.getActiveWindow()
        if (activeWin && activeWin.executable !== 'VoiceFloo.exe' && activeWin.executable !== 'unknown') {
          setTargetWindow(activeWin)
        }

        window.api.setOverlayMode(true)
        if (activeWin && activeWin.pid) {
          window.api.injectTextInput('', false, activeWin.pid)
        }

        await audioEngine.startRecording()
        setMicState('recording')
        
        const activeSession = audioEngine.recorder.getSession()
        if (activeSession) {
          speechEngine.startSession(activeSession.id)
        }
      } catch (err) {
        console.error('Failed to start recording session:', err)
        window.api.setOverlayMode(false)
      }
    } else if (micState === 'recording' || micState === 'paused') {
      await handleStopRecording()
    }
  }
  handleMicClickRef.current = handleMicClick

  const handleStopRecording = async () => {
    await audioEngine.stopRecording()
    setMicState('processing')

    const finalText = await speechEngine.stopSession()

    if (finalText && finalText.trim().length > 0) {
      await window.api.injectTextInput(finalText, true, targetWindowRef.current?.pid)
      setMicState('success')
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setMicState('idle')
    window.api.setOverlayMode(false)
    window.api.close()
  }

  const handleCheckUpdates = async () => {
    setUpdateStatus('checking')
    await window.api.checkForUpdates(true)
  }

  const handleDownloadUpdate = async () => {
    setUpdateStatus('downloading')
    await window.api.downloadUpdate()
  }

  const handleInstallUpdate = () => {
    window.api.installAndRestartUpdate()
  }

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-transparent overflow-hidden select-none font-sans antialiased text-white">
      <AnimatePresence 
        onExitComplete={() => {
          if (isFadingOut) {
            window.api.notifyHideComplete()
          }
        }}
      >
        {isRendered && !isFadingOut && (
          showSettings ? (
            /* ============================================================ */
            /* 1. STANDALONE SETTINGS WINDOW                                */
            /* ============================================================ */
            <motion.div
              key="settings-window"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full h-full flex flex-col bg-[#0A0F1E]/95 border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden relative"
            >
              {/* Settings Header with Custom Title & Drag Region */}
              <div 
                className="h-14 border-b border-white/5 flex items-center justify-between px-5 select-none shrink-0"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold tracking-wide uppercase text-white/90">VoiceFloo Settings</span>
                </div>
                <button 
                  onClick={() => {
                    setShowSettings(false)
                    window.api.setOverlayMode(false) // hides settings window back to tray
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                  style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Core 6 Categories Configuration List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                
                {/* CATEGORY 1: HOTKEYS */}
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5 text-white/80 font-semibold text-xs">
                      <Keyboard className="w-3.5 h-3.5 text-blue-400" />
                      <span>Global Shortcut (Hotkeys)</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">Summon or dismiss the floating overlay pill instantly.</p>
                  </div>
                  <input 
                    type="text" 
                    value={shortcut} 
                    onChange={(e) => setShortcut(e.target.value)}
                    className="w-44 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white text-center focus:outline-none focus:border-blue-500/50" 
                  />
                </div>

                {/* CATEGORY 2: MICROPHONE */}
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5 text-white/80 font-semibold text-xs">
                      <Mic className="w-3.5 h-3.5 text-blue-400" />
                      <span>Input Microphone</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">Select your default input recording hardware.</p>
                  </div>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                    className="w-44 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    {devicesList.length === 0 ? (
                      <option value="default" className="bg-[#0A0F1E]">Default Microphone</option>
                    ) : (
                      devicesList.map((device) => (
                        <option key={device.deviceId} value={device.deviceId} className="bg-[#0A0F1E]">
                          {device.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* CATEGORY 3: LANGUAGE */}
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5 text-white/80 font-semibold text-xs">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>Dictation Language</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">Primary speech recognition translation target.</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-44 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="AUTO" className="bg-[#0A0F1E]">Auto Detect</option>
                    <option value="EN" className="bg-[#0A0F1E]">English</option>
                    <option value="ES" className="bg-[#0A0F1E]">Spanish (Español)</option>
                    <option value="FR" className="bg-[#0A0F1E]">French (Français)</option>
                    <option value="DE" className="bg-[#0A0F1E]">German (Deutsch)</option>
                    <option value="JA" className="bg-[#0A0F1E]">Japanese (日本語)</option>
                    <option value="ZH" className="bg-[#0A0F1E]">Chinese (中文)</option>
                  </select>
                </div>

                {/* CATEGORY 4: MODELS */}
                <div className="space-y-3 border-b border-white/5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-white/80 font-semibold text-xs">
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Whisper AI Engine Model</span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">Choose local Whisper language transcription model weights.</p>
                    </div>
                    <select
                      value={wizardModelId}
                      onChange={(e) => {
                        setWizardModelId(e.target.value)
                        const selected = modelsList.find(m => m.id === e.target.value)
                        if (selected) {
                          setIsWhisperReady(selected.installed)
                        }
                      }}
                      className="w-44 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                    >
                      {modelsList.map((model) => (
                        <option key={model.id} value={model.id} className="bg-[#0A0F1E]">
                          {model.name} {model.installed ? '(Installed)' : '(Download needed)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model download control section */}
                  {modelsList.find(m => m.id === wizardModelId && !m.installed) && (
                    <div className="p-3.5 rounded-lg border border-white/5 bg-white/[0.01] space-y-3">
                      <div className="flex justify-between text-[10px] font-medium text-white/50">
                        <span>Model Size: {modelsList.find(m => m.id === wizardModelId)?.size}</span>
                      </div>
                      {downloadState.isDownloading ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-bold text-white/40">
                            <span>Downloading Model: {downloadState.percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${downloadState.percent}%` }} />
                          </div>
                          <button 
                            onClick={handleCancelDownload}
                            className="text-[9px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Cancel Download
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleStartModelDownload}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Download Model ({modelsList.find(m => m.id === wizardModelId)?.size})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* CATEGORY 5: UPDATES */}
                <div className="space-y-3 border-b border-white/5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-white/80 font-semibold text-xs">
                        <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                        <span>Application Updates</span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">Check and download latest patches and releases.</p>
                    </div>
                    {updateStatus === 'idle' || updateStatus === 'error' ? (
                      <button 
                        onClick={handleCheckUpdates}
                        className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Check Now
                      </button>
                    ) : updateStatus === 'checking' ? (
                      <span className="text-[10px] font-bold text-white/40">Checking...</span>
                    ) : updateStatus === 'available' ? (
                      <button 
                        onClick={handleDownloadUpdate}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Download Update
                      </button>
                    ) : updateStatus === 'downloading' ? (
                      <div className="w-44 text-right">
                        <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden relative mb-1">
                          <div className="h-full bg-blue-500" style={{ width: `${updateProgress}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-white/40">{updateProgress}% Downloaded</span>
                      </div>
                    ) : (
                      <button 
                        onClick={handleInstallUpdate}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Install & Relaunch
                      </button>
                    )}
                  </div>
                  {updateStatus === 'error' && (
                    <p className="text-[9px] text-red-400">Failed to check for updates. Try again later.</p>
                  )}
                </div>

                {/* CATEGORY 6: ABOUT */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-3.5">
                  <Info className="w-4.5 h-4.5 text-blue-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white/95">VoiceFloo</h3>
                    <p className="text-[10px] text-white/45 leading-relaxed">
                      Version 1.0.0 (Production Release)<br />
                      Offline AI Voice Dictation Desktop Utility.<br />
                      Runs directly on local Whisper models for zero data leaks.
                    </p>
                    <div className="pt-2 text-[10px] font-medium flex gap-3">
                      <a 
                        href="https://voicefloo.com"
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Website
                      </a>
                      <span className="text-white/15">•</span>
                      <span className="text-white/30">© 2026 VoiceFloo. All rights reserved.</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            /* ============================================================ */
            /* 2. FLOATING Dictation Overlay Pill                           */
            /* ============================================================ */
            (micState !== 'idle') && (
              <motion.div 
                key="dictation-pill-overlay"
                className="w-[440px] h-[76px] flex items-center justify-between bg-[#0B0F19]/80 border border-white/10 rounded-[38px] px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-3xl select-none relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
              >
                <AnimatePresence mode="wait">
                  {(micState === 'recording' || micState === 'paused') ? (
                    /* LISTENING AND PAUSED STATES */
                    <motion.div
                      key="listening-state-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-between"
                    >
                      {/* Cancel (Discard) Button */}
                      <button 
                        onClick={handleCancelRecording}
                        className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/15 text-white/50 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-inner"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        title="Cancel"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>

                      {/* Waveform Visualization in Center */}
                      <OverlayWaveform 
                        level={liveLevel} 
                        isPaused={micState === 'paused'} 
                      />

                      {/* Pause / Resume Button */}
                      {micState === 'recording' ? (
                        <button 
                          onClick={handlePauseRecording}
                          className="w-11 h-11 rounded-full bg-[#FF3B30] border border-red-400/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,59,48,0.4)]"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          title="Pause"
                        >
                          <Pause className="w-4 h-4 fill-white" />
                        </button>
                      ) : (
                        <button 
                          onClick={handleResumeRecording}
                          className="w-11 h-11 rounded-full bg-[#FF3B30] border border-red-400/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,59,48,0.4)]"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          title="Resume"
                        >
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </button>
                      )}
                    </motion.div>
                  ) : micState === 'processing' ? (
                    /* PROCESSING/TRANSCRIBING STATE */
                    <motion.div
                      key="processing-state-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <motion.div 
                            className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-400"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                        </div>
                        <span className="text-xs font-semibold text-white/95 tracking-wide">Transcribing dictation...</span>
                      </div>
                      
                      <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden relative">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                    </motion.div>
                  ) : micState === 'success' ? (
                    /* SUCCESS STATE */
                    <motion.div
                      key="success-state-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-center gap-3"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                        className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </motion.div>
                      <span className="text-xs font-bold text-white/95 tracking-wide">
                        Typed Successfully
                      </span>
                    </motion.div>
                  ) : (
                    /* ERROR STATE */
                    <motion.div
                      key="error-state-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="w-4.5 h-4.5" />
                        <span className="text-xs font-bold tracking-wide">
                          {showPermissionError ? 'Mic Permission Denied' : 'Microphone Not Found'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showPermissionError ? (
                          <button 
                            onClick={handleRetryPermission}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all cursor-pointer"
                            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          >
                            Settings
                          </button>
                        ) : (
                          <button 
                            onClick={handleRetryPermission}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold transition-all cursor-pointer"
                            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          >
                            Retry
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setMicState('idle')
                            window.api.setOverlayMode(false)
                            window.api.close()
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          )
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
