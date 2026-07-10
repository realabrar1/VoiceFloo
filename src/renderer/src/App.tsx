import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToggleLeft, ToggleRight, Sparkles, Play, Pause, AlertCircle, Check, X } from 'lucide-react'
import { AnimatedBackground } from './components/AnimatedBackground'

// Import the Audio Engine orchestrator and types
import { audioEngine } from './services/audio/audio-engine'
import { AudioInputDevice } from './services/audio/audio-device-manager'

// Import the Speech Engine orchestrator
import { speechEngine } from './services/speech/speech-engine'

interface OverlayWaveformProps {
  level: number
  isPaused: boolean
  isSpeaking: boolean
}

const OverlayWaveform: React.FC<OverlayWaveformProps> = ({ level, isPaused, isSpeaking }) => {
  const barCount = 52
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
          
          let targetHeight = 4
          if (isSpeaking) {
            const randomFactor = 0.4 + Math.random() * 0.6
            targetHeight = 4 + level * 70 * factor * randomFactor
          } else {
            const time = Date.now() * 0.006
            const sineWave = Math.sin(time + i * 0.3)
            targetHeight = 4 + Math.max(0, sineWave * 8 * factor)
          }

          return Math.max(4, Math.min(32, targetHeight))
        })
      })
    }, 20)

    return () => clearInterval(interval)
  }, [level, isPaused, isSpeaking])

  return (
    <div className="flex items-center justify-center gap-[3px] h-9 px-2 w-[180px] overflow-hidden select-none">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-gradient-to-t from-blue-500 to-cyan-400"
          animate={{ height: h }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        />
      ))}
    </div>
  )
}

const formatTimer = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function App(): React.JSX.Element {
  // Sync state with AudioEngine
  const [micState, setMicState] = useState<'idle' | 'recording' | 'paused' | 'error' | 'processing' | 'success'>('idle')
  const [liveLevel, setLiveLevel] = useState(0)
  const [duration, setDuration] = useState(0)

  // Speech Recognition states
  const [isWhisperReady, setIsWhisperReady] = useState(true)
  const [modelsList, setModelsList] = useState<any[]>([])
  const [wizardModelId, setWizardModelId] = useState('base')
  const [downloadState, setDownloadState] = useState({
    isDownloading: false,
    type: 'model',
    percent: 0
  })

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isVadSilenced, setIsVadSilenced] = useState(false)

  // Windows Input Engine configuration states
  const [inputStrategy, setInputStrategy] = useState<'auto' | 'keyboard' | 'clipboard'>('auto')
  const [typingSpeed, setTypingSpeed] = useState(0)
  const [autoRestoreClipboard, setAutoRestoreClipboard] = useState(true)
  const [delayBeforeTyping, setDelayBeforeTyping] = useState(50)
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true)
  const [targetWindow, setTargetWindow] = useState<{ pid: number; executable: string; title: string } | null>(null)

  // Device list states
  const [devicesList, setDevicesList] = useState<AudioInputDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('default')

  // Overlay states
  const [showSettings, setShowSettings] = useState(false)
  const [showPermissionError, setShowPermissionError] = useState(false)

  // Settings states
  const [shortcut, setShortcut] = useState(() => {
    return localStorage.getItem('voicefloo-shortcut') || 'Option + Space'
  })
  const [aiMode, setAiMode] = useState('Smart Format')
  const [launchAtStartup, setLaunchAtStartup] = useState(false)
  const [language, setLanguage] = useState('EN')

  // Refs to prevent stale closures inside global event subscriptions
  const targetWindowRef = React.useRef<{ pid: number; executable: string; title: string } | null>(null)
  
  const handleMicClickRef = React.useRef<any>(null)
  
  targetWindowRef.current = targetWindow

  // Sync global shortcut registration with the main process on change
  useEffect(() => {
    window.api.registerGlobalShortcut(shortcut)
  }, [shortcut])
  
  // Whisper specific configurations
  const [activeModelId, setActiveModelId] = useState('base')
  const [cpuThreads, setCpuThreads] = useState(4)
  const [vadEnabled, setVadEnabled] = useState(true)

  // Visual transitions state
  const [isRendered, setIsRendered] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Sync Input Engine options with the main process on change
  useEffect(() => {
    window.api.setInputOptions({
      strategy: inputStrategy,
      typingSpeed: typingSpeed,
      autoRestoreClipboard: autoRestoreClipboard,
      delayBeforeTyping: delayBeforeTyping,
      voiceCommandsEnabled: voiceCommandsEnabled
    })
  }, [inputStrategy, typingSpeed, autoRestoreClipboard, delayBeforeTyping, voiceCommandsEnabled])

  // Initial event bindings
  useEffect(() => {
    // 1. Fade-in handler on startup/show
    const removeFadeIn = window.api.onWindowFadeIn(() => {
      setIsFadingOut(false)
      setIsRendered(true)
    })

    // 2. Fade-out trigger
    const removeFadeOut = window.api.onWindowFadeOut(() => {
      setIsFadingOut(true)
    })

    // 3. Open settings trigger
    const removeOpenSettings = window.api.onOpenSettings(() => {
      setShowSettings(true)
      window.api.getStartupStatus().then((status) => {
        setLaunchAtStartup(status)
      })
    })

    // 4. Download IPC event subscriptions
    const removeDownloadProgress = window.api.onDownloadProgress((data) => {
      setDownloadState({
        isDownloading: true,
        type: data.type,
        percent: data.percent
      })
    })

    const removeDownloadSuccess = (modelId: string) => {
      setDownloadState({ isDownloading: false, type: 'model', percent: 100 })
      setIsWhisperReady(true)
      setActiveModelId(modelId)
      window.api.getModelsList().then((list) => setModelsList(list))
    }
    const unsubSuccess = window.api.onDownloadSuccess(removeDownloadSuccess)

    // 5. Audio & Speech event bindings
    const handleDeviceChanged = (deviceId: string) => {
      setSelectedDeviceId(deviceId)
      const list = audioEngine.devices.getDevices()
      setDevicesList(list)
    }

    const handleDevicesUpdated = (list: AudioInputDevice[]) => {
      setDevicesList(list)
    }

    const handleTranscriptUpdated = (text: string) => {
      window.api.injectTextInput(text, false, targetWindowRef.current?.pid)
    }

    const handleSpeechActive = () => {
      setIsSpeaking(true)
      setIsVadSilenced(false)
    }

    const handleSilenceDetected = () => {
      setIsSpeaking(false)
      setIsVadSilenced(true)
    }

    audioEngine.events.on('AudioLevelChanged', (level: number) => setLiveLevel(level))
    audioEngine.events.on('RecordingDurationUpdated', (secs: number) => setDuration(secs))
    audioEngine.events.on('PermissionDenied', () => { setShowPermissionError(true); setMicState('error') })
    audioEngine.events.on('DeviceChanged', handleDeviceChanged)
    audioEngine.events.on('DevicesUpdated', handleDevicesUpdated)

    audioEngine.events.on('TranscriptUpdated', handleTranscriptUpdated)
    audioEngine.events.on('SpeechActive', handleSpeechActive)
    audioEngine.events.on('SilenceDetected', handleSilenceDetected)

    const removeGlobalShortcutPress = window.api.onGlobalShortcutPress((win) => {
      if (handleMicClickRef.current) {
        handleMicClickRef.current(win)
      }
    })

    return () => {
      removeFadeIn()
      removeFadeOut()
      removeOpenSettings()
      removeDownloadProgress()
      unsubSuccess()
      removeGlobalShortcutPress()
      audioEngine.events.off('TranscriptUpdated', handleTranscriptUpdated)
    }
  }, [])

  // Sync settings panel and refresh devices
  useEffect(() => {
    if (showSettings) {
      window.api.getStartupStatus().then((status) => {
        setLaunchAtStartup(status)
      })
      window.api.getModelsList().then((list) => {
        setModelsList(list)
      })
      audioEngine.devices.refreshDevices().then((list) => {
        setDevicesList(list)
      })
    }
  }, [showSettings])

  // Sync SpeechEngine options on changes
  useEffect(() => {
    speechEngine.setOptions({
      modelId: activeModelId,
      language: language.toLowerCase() === 'auto' ? 'auto' : language.toLowerCase(),
      threads: cpuThreads,
      vadEnabled: vadEnabled
    })
  }, [activeModelId, language, cpuThreads, vadEnabled])

  // Model Download triggers
  const handleStartModelDownload = async () => {
    try {
      setDownloadState({ isDownloading: true, type: 'model', percent: 0 })
      await window.api.downloadModel(wizardModelId)
    } catch (err: any) {
      console.error(err)
    }
  }

  // Handle Startup status switch click
  const handleToggleStartup = async () => {
    const nextStatus = !launchAtStartup
    const success = await window.api.toggleStartup(nextStatus)
    if (success) {
      setLaunchAtStartup(nextStatus)
    }
  }

  const handleDeviceSelect = async (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    await audioEngine.devices.selectDevice(deviceId)
  }

  const handlePauseRecording = () => {
    audioEngine.pauseRecording()
    speechEngine.pauseRecording()
    setMicState('paused')
    setIsSpeaking(false)
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
    setIsSpeaking(false)
    setIsVadSilenced(false)
    window.api.setOverlayMode(false)
    window.api.close()
  }

  const handleRetryPermission = async () => {
    setShowPermissionError(false)
    setMicState('idle')
    await handleMicClick()
  }

  const handleCancelDownload = () => {
    window.api.cancelDownload()
    setDownloadState({ isDownloading: false, type: 'model', percent: 0 })
  }

  // Toggle Dictation session
  const handleMicClick = async () => {
    if (!isWhisperReady) return

    if (micState === 'idle' || micState === 'error') {
      try {
        setDuration(0)
        setLiveLevel(0)
        setIsSpeaking(false)
        setIsVadSilenced(false)
        setTargetWindow(null)

        window.api.resetInputSession()
        
        let win = await window.api.getActiveWindow()
        if (win && win.executable !== 'VoiceFloo.exe' && win.executable !== 'unknown') {
          setTargetWindow(win)
        }

        window.api.setOverlayMode(true)
        if (win && win.pid) {
          window.api.injectTextInput('', false, win.pid)
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

  // Update handler ref on every render to prevent React closure staleness
  handleMicClickRef.current = handleMicClick

  const handleStopRecording = async () => {
    await audioEngine.stopRecording()
    setMicState('processing')
    setIsSpeaking(false)
    setIsVadSilenced(false)

    const finalText = await speechEngine.stopSession()

    if (finalText && finalText.trim().length > 0) {
      await window.api.injectTextInput(finalText, true, targetWindowRef.current?.pid)
      setMicState('success')
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    setMicState('idle')
    window.api.setOverlayMode(false)
    window.api.close()
  }

  const handleOpenSystemSettings = () => {
    window.api.openSystemSettings()
  }

  return (
    <div className="relative w-screen h-screen p-2.5 flex items-center justify-center bg-transparent overflow-hidden">
      {/* Animated Liquid Background only in Settings mode */}
      {showSettings && <AnimatedBackground />}

      <AnimatePresence 
        onExitComplete={() => {
          if (isFadingOut) {
            window.api.notifyHideComplete()
          }
        }}
      >
        {isRendered && !isFadingOut && (
          showSettings ? (
            /* STANDALONE SETTINGS WINDOW VIEW */
            <motion.div
              key="settings-window"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full h-full flex flex-col bg-[#0A0F1E]/95 border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden select-none relative"
            >
              {/* Settings Header with custom title & Drag region */}
              <div 
                className="h-14 border-b border-white/5 flex items-center justify-between px-5 select-none shrink-0"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white tracking-wide">VoiceFloo Settings</span>
                </div>
                <button 
                  onClick={() => {
                    setShowSettings(false)
                    window.api.setOverlayMode(false) // dynamically hides the settings window
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                  style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                {/* 1. Global Shortcut */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Global Shortcut Trigger</label>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/40 text-[9px] font-mono border border-white/5">Accelerator</span>
                  </div>
                  <input 
                    type="text" 
                    value={shortcut} 
                    onChange={(e) => setShortcut(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" 
                  />
                  <p className="text-[10px] text-white/35">Global key combination to summon the floating recording overlay pill instantly.</p>
                </div>

                {/* 2. Launch on Startup */}
                <div className="flex items-center justify-between border-b border-white/5 pb-5">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Launch on Startup</label>
                    <p className="text-[10px] text-white/40 leading-relaxed">Start VoiceFloo automatically when logging into Windows.</p>
                  </div>
                  <button 
                    onClick={handleToggleStartup} 
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {launchAtStartup ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-white/20" />}
                  </button>
                </div>

                {/* 3. Input Microphone */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Input Device (Microphone)</label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
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

                {/* 4. Active AI Model */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-sans">Whisper AI Model</label>
                  <select
                    value={activeModelId}
                    onChange={(e) => {
                      setActiveModelId(e.target.value)
                      const selected = modelsList.find(m => m.id === e.target.value)
                      if (selected) {
                        setWizardModelId(selected.id)
                        setIsWhisperReady(selected.installed)
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  >
                    {modelsList.map((model) => (
                      <option key={model.id} value={model.id} className="bg-[#0A0F1E]">
                        {model.name} {model.installed ? '(Installed)' : '(Download required)'}
                      </option>
                    ))}
                  </select>

                  {/* Model Download Progress Section */}
                  {modelsList.find(m => m.id === activeModelId && !m.installed) && (
                    <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-3 mt-3">
                      <div className="flex justify-between text-[10px] font-medium">
                        <span className="text-white/45 font-sans">Model Size:</span>
                        <span className="text-white font-semibold">{modelsList.find(m => m.id === activeModelId)?.size}</span>
                      </div>
                      {downloadState.isDownloading ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-bold text-white/50">
                            <span>Downloading {downloadState.percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${downloadState.percent}%` }} />
                          </div>
                          <button 
                            onClick={handleCancelDownload}
                            className="text-[9px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
                            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          >
                            Cancel Download
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleStartModelDownload}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        >
                          Download Model ({modelsList.find(m => m.id === activeModelId)?.size})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Typing Strategy */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Text Insertion Strategy</label>
                  <select
                    value={inputStrategy}
                    onChange={(e) => setInputStrategy(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="auto" className="bg-[#0A0F1E]">Automatic (Recommended)</option>
                    <option value="keyboard" className="bg-[#0A0F1E]">Keyboard Emulation (Live Typing)</option>
                    <option value="clipboard" className="bg-[#0A0F1E]">Clipboard Strategy (Instant Paste)</option>
                  </select>
                </div>

                {/* 6. CPU Threads */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Inference Threads</label>
                  <select
                    value={cpuThreads}
                    onChange={(e) => setCpuThreads(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    {[2, 4, 6, 8, 12].map(t => (
                      <option key={t} value={t} className="bg-[#0A0F1E]">{t} Threads</option>
                    ))}
                  </select>
                </div>

                {/* 7. VAD Silence Detection */}
                <div className="flex items-center justify-between border-b border-white/5 pb-5">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Silence Detection (VAD)</label>
                    <p className="text-[10px] text-white/40 leading-relaxed">Automatically pause the recording when silence is detected.</p>
                  </div>
                  <button 
                    onClick={() => setVadEnabled(!vadEnabled)} 
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  >
                    {vadEnabled ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-white/20" />}
                  </button>
                </div>

                {/* 7a. Delay before typing */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-sans">Delay Before Typing</label>
                    <span className="text-[10px] font-bold text-white/70 font-mono">{delayBeforeTyping} ms</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={delayBeforeTyping}
                    onChange={(e) => setDelayBeforeTyping(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  />
                </div>

                {/* 7b. Typing Speed delay */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-sans">Char Typing Delay</label>
                    <span className="text-[10px] font-bold text-white/70 font-mono">{typingSpeed} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={typingSpeed}
                    onChange={(e) => setTypingSpeed(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  />
                </div>

                {/* 7c. Auto Restore Clipboard */}
                <div className="flex items-center justify-between border-b border-white/5 pb-5">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-sans">Restore Clipboard</label>
                    <p className="text-[10px] text-white/40 leading-relaxed font-sans">Restore previous clipboard content automatically after typing.</p>
                  </div>
                  <button 
                    onClick={() => setAutoRestoreClipboard(!autoRestoreClipboard)} 
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  >
                    {autoRestoreClipboard ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-white/20" />}
                  </button>
                </div>

                {/* 7d. Voice Commands */}
                <div className="flex items-center justify-between border-b border-white/5 pb-5">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase font-sans">Voice Commands</label>
                    <p className="text-[10px] text-white/40 leading-relaxed font-sans">Recognize voice control commands like "undo", "newline".</p>
                  </div>
                  <button 
                    onClick={() => setVoiceCommandsEnabled(!voiceCommandsEnabled)} 
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  >
                    {voiceCommandsEnabled ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-white/20" />}
                  </button>
                </div>

                {/* 8. AI Formatting Mode */}
                <div className="space-y-2 border-b border-white/5 pb-5">
                  <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">AI Post-Processing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Raw text', 'Smart Format', 'Bullet Points'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setAiMode(mode)}
                        className={`py-2 text-[10px] font-bold rounded-xl border cursor-pointer transition-all duration-200 ${
                          aiMode === mode 
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-200 shadow-md' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 9. Language Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Dictation Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="AUTO" className="bg-[#0A0F1E]">Auto Detect Language</option>
                    <option value="EN" className="bg-[#0A0F1E]">English</option>
                    <option value="ES" className="bg-[#0A0F1E]">Spanish (Español)</option>
                    <option value="FR" className="bg-[#0A0F1E]">French (Français)</option>
                    <option value="DE" className="bg-[#0A0F1E]">German (Deutsch)</option>
                    <option value="JA" className="bg-[#0A0F1E]">Japanese (日本語)</option>
                    <option value="ZH" className="bg-[#0A0F1E]">Chinese (中文)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ) : (
            /* DICTATION FLOATING PILL OVERLAY (State-dependent) */
            (micState !== 'idle') && (
              <motion.div 
                key="dictation-pill-overlay"
                className="w-full h-full flex items-center justify-between bg-[#0A0F1E]/88 border border-white/10 rounded-full px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-[30px] select-none relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
              >
                <AnimatePresence mode="wait">
                  {(micState === 'recording' || micState === 'paused') ? (
                    <motion.div
                      key="recording-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-between"
                    >
                      {/* Cancel / X Button */}
                      <button 
                        onClick={handleCancelRecording}
                        className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 hover:scale-105 hover:bg-red-500/20 hover:border-red-500/30 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-inner"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        title="Discard"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Waveform & Details */}
                      <div className="flex-1 flex items-center justify-between px-3 gap-2">
                        <OverlayWaveform 
                          level={liveLevel} 
                          isPaused={micState === 'paused'} 
                          isSpeaking={isSpeaking || liveLevel > 0.015} 
                        />
                        
                        <div className="flex flex-col items-start justify-center min-w-[70px]">
                          <span className="text-[10px] font-bold text-white/90 tracking-wide flex items-center gap-1 select-none">
                            {micState === 'recording' ? (
                              <>
                                <span className={`w-1.5 h-1.5 rounded-full ${isVadSilenced ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
                                <span>{isVadSilenced ? 'Silenced' : 'Listening'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Paused</span>
                              </>
                            )}
                          </span>
                          <span className="text-[9px] font-semibold text-white/45 font-mono mt-0.5 select-text">
                            {formatTimer(duration)}
                          </span>
                        </div>
                      </div>

                      {/* Pause / Resume Button */}
                      {micState === 'recording' ? (
                        <button 
                          onClick={handlePauseRecording}
                          className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 border border-blue-400/30 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:shadow-[0_0_18px_rgba(59,130,246,0.5)]"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          title="Pause"
                        >
                          <Pause className="w-4 h-4 fill-white/20" />
                        </button>
                      ) : (
                        <button 
                          onClick={handleResumeRecording}
                          className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 border border-blue-400/30 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:shadow-[0_0_18px_rgba(59,130,246,0.5)]"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          title="Resume"
                        >
                          <Play className="w-4 h-4 fill-white/20 ml-0.5" />
                        </button>
                      )}
                    </motion.div>
                  ) : micState === 'processing' ? (
                    /* Processing State */
                    <motion.div
                      key="processing-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-between px-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                        <span className="text-xs font-semibold text-white/90 tracking-wide">Processing...</span>
                      </div>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                    </motion.div>
                  ) : micState === 'success' ? (
                    /* Success State */
                    <motion.div
                      key="success-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-center gap-2.5"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </motion.div>
                      <span className="text-xs font-semibold text-white/90">
                        ✓ Typed Successfully
                      </span>
                    </motion.div>
                  ) : (
                    /* Error State */
                    <motion.div
                      key="error-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full flex items-center justify-between px-3"
                    >
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="w-4.5 h-4.5" />
                        <span className="text-[10px] font-bold tracking-wide">
                          {showPermissionError ? 'Mic Permission Denied' : 'Mic Not Found'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {showPermissionError ? (
                          <button 
                            onClick={handleOpenSystemSettings}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold transition-colors cursor-pointer"
                            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                          >
                            Settings
                          </button>
                        ) : (
                          <button 
                            onClick={handleRetryPermission}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-white text-[9px] font-bold transition-all cursor-pointer"
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
                          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        >
                          <X className="w-4 h-4" />
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
