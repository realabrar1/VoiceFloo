import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ArrowLeft, ToggleLeft, ToggleRight, Sparkles, Trash2, Play, Pause, AlertCircle, Check, Loader2, Keyboard, Clipboard } from 'lucide-react'
import { TitleBar } from './components/TitleBar'
import { AnimatedBackground } from './components/AnimatedBackground'
import { GlassCard } from './components/GlassCard'
import { FloatingMicButton } from './components/FloatingMicButton'
import { StatusIndicator } from './components/StatusIndicator'
import { BottomToolbar } from './components/BottomToolbar'
import { GlassButton } from './components/GlassButton'

// Import the Audio Engine orchestrator and types
import { audioEngine } from './services/audio/audio-engine'
import { AudioInputDevice } from './services/audio/audio-device-manager'

// Import the Speech Engine orchestrator
import { speechEngine } from './services/speech/speech-engine'
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard'

// Real-time Visual Waveform Component
interface VisualWaveformProps {
  level: number
  isPaused: boolean
}

const VisualWaveform: React.FC<VisualWaveformProps> = ({ level, isPaused }) => {
  const [heights, setHeights] = useState<number[]>(new Array(15).fill(4))

  useEffect(() => {
    if (isPaused) {
      setHeights(new Array(15).fill(4))
      return
    }

    // Generate real-time bar heights at ~60 FPS
    const interval = setInterval(() => {
      setHeights(() => {
        return Array.from({ length: 15 }).map((_, i) => {
          const factor = Math.sin((i / 14) * Math.PI) // Peak in the center
          const randomFactor = 0.5 + Math.random() * 0.5
          // Scale based on audio level
          const height = 4 + level * 64 * factor * randomFactor
          return Math.max(4, Math.min(68, height))
        })
      })
    }, 16)

    return () => clearInterval(interval)
  }, [level, isPaused])

  return (
    <div className="flex items-center justify-center gap-1.5 h-20 select-none bg-white/[0.01] border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-inner w-full max-w-[260px]">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-blue-400"
          animate={{ height: h }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      ))}
    </div>
  )
}

function App(): React.JSX.Element {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(() => {
    return localStorage.getItem('voicefloo-onboarding-completed') === 'true'
  })

  // Sync state with AudioEngine
  const [micState, setMicState] = useState<'idle' | 'recording' | 'paused' | 'error'>('idle')
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

  // Live Transcription outputs
  const [liveTranscript, setLiveTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isVadSilenced, setIsVadSilenced] = useState(false)

  // Windows Input Engine configuration states
  const [inputStrategy, setInputStrategy] = useState<'auto' | 'keyboard' | 'clipboard'>('auto')
  const [typingSpeed, setTypingSpeed] = useState(0)
  const [autoRestoreClipboard, setAutoRestoreClipboard] = useState(true)
  const [delayBeforeTyping, setDelayBeforeTyping] = useState(50)
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true)
  const [targetWindow, setTargetWindow] = useState<{ executable: string; title: string } | null>(null)

  // Device list states
  const [devicesList, setDevicesList] = useState<AudioInputDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('default')
  const [selectedDeviceLabel, setSelectedDeviceLabel] = useState('Default Microphone')

  // Overlay states
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showPermissionError, setShowPermissionError] = useState(false)

  // Settings states
  const [shortcut, setShortcut] = useState('Option + Space')
  const [aiMode, setAiMode] = useState('Smart Format')
  const [launchAtStartup, setLaunchAtStartup] = useState(false)
  const [language, setLanguage] = useState('EN')
  
  // Whisper specific configurations
  const [activeModelId, setActiveModelId] = useState('base')
  const [cpuThreads, setCpuThreads] = useState(4)
  const [vadEnabled, setVadEnabled] = useState(true)

  // Auto Updater settings & status
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(true)
  const [autoDownloadUpdates, setAutoDownloadUpdates] = useState(false)
  const [releaseChannel, setReleaseChannel] = useState<'stable' | 'beta' | 'dev'>('stable')
  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'not-available' | 'error'>('idle')
  const [updateProgress, setUpdateProgress] = useState<any>(null)
  const [availableUpdateInfo, setAvailableUpdateInfo] = useState<any>(null)
  const [updateErrorMessage, setUpdateErrorMessage] = useState('')

  // Visual transitions state
  const [isRendered, setIsRendered] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Transcription history state
  const [historyItems, setHistoryItems] = useState([
    { id: 1, text: 'This is a premium desktop dictation utility built using Electron, React, and Tailwind CSS v4.', time: '2 mins ago' },
    { id: 2, text: 'Ensure the window transparency and always-on-top flags are working correctly.', time: '1 hour ago' },
    { id: 3, text: 'Bootstrapping VoiceFloo with clean React components and TypeScript types.', time: 'Yesterday' }
  ])

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

  // Sync auto-updater settings with the main process on change
  useEffect(() => {
    window.api.setUpdateSettings({
      autoCheck: autoCheckUpdates,
      autoDownload: autoDownloadUpdates,
      channel: releaseChannel
    })
  }, [autoCheckUpdates, autoDownloadUpdates, releaseChannel])

  // Initialize and register audio & speech listeners
  useEffect(() => {
    // 1. Check Whisper and Model states
    window.api.isWhisperReady().then((ready) => {
      setIsWhisperReady(ready)
    })

    window.api.getModelsList().then((list) => {
      setModelsList(list)
    })

    // 2. Diagnostics setup for audio inputs
    audioEngine.initialize().then(() => {
      setDevicesList(audioEngine.devices.getDevices())
      setSelectedDeviceId(audioEngine.devices.getSelectedDeviceId())
      updateDeviceLabel(audioEngine.devices.getSelectedDeviceId(), audioEngine.devices.getDevices())
    })

    // 3. Window transition listeners
    const removeFadeIn = window.api.onWindowFadeIn(() => {
      setIsFadingOut(false)
      setIsRendered(true)
    })

    const removeFadeOut = window.api.onWindowFadeOut(() => {
      setIsFadingOut(true)
    })

    const removeOpenSettings = window.api.onOpenSettings(() => {
      setShowSettings(true)
      setIsFadingOut(false)
      setIsRendered(true)
    })

    // Read startup configuration
    window.api.getStartupStatus().then((status) => {
      setLaunchAtStartup(status)
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

    const removeDownloadError = (errorMsg: string) => {
      setDownloadState({ isDownloading: false, type: 'model', percent: 0 })
      alert(`Installation failed: ${errorMsg}`)
    }
    const unsubError = window.api.onDownloadError(removeDownloadError)

    // 5. Audio & Speech event bindings
    const handleLevelChanged = (level: number) => {
      setLiveLevel(level)
    }

    const handleDurationUpdated = (secs: number) => {
      setDuration(secs)
    }

    const handlePermissionDenied = () => {
      setShowPermissionError(true)
      setMicState('error')
    }

    const handleDeviceChanged = (deviceId: string) => {
      setSelectedDeviceId(deviceId)
      const list = audioEngine.devices.getDevices()
      setDevicesList(list)
      updateDeviceLabel(deviceId, list)
    }

    const handleDevicesUpdated = (list: AudioInputDevice[]) => {
      setDevicesList(list)
      updateDeviceLabel(audioEngine.devices.getSelectedDeviceId(), list)
    }

    const handleTranscriptUpdated = (text: string) => {
      setLiveTranscript(text)
      // Stream incremental keystrokes live
      window.api.injectTextInput(text, false)
    }

    const handleSpeechActive = () => {
      setIsSpeaking(true)
      setIsVadSilenced(false)
    }

    const handleSilenceDetected = () => {
      setIsSpeaking(false)
      setIsVadSilenced(true)
    }

    audioEngine.events.on('AudioLevelChanged', handleLevelChanged)
    audioEngine.events.on('RecordingDurationUpdated', handleDurationUpdated)
    audioEngine.events.on('PermissionDenied', handlePermissionDenied)
    audioEngine.events.on('DeviceChanged', handleDeviceChanged)
    audioEngine.events.on('DevicesUpdated', handleDevicesUpdated)

    audioEngine.events.on('TranscriptUpdated', handleTranscriptUpdated)
    audioEngine.events.on('SpeechActive', handleSpeechActive)
    audioEngine.events.on('SilenceDetected', handleSilenceDetected)

    return () => {
      removeFadeIn()
      removeFadeOut()
      removeOpenSettings()
      removeDownloadProgress()
      unsubSuccess()
      unsubError()

      audioEngine.events.off('AudioLevelChanged', handleLevelChanged)
      audioEngine.events.off('RecordingDurationUpdated', handleDurationUpdated)
      audioEngine.events.off('PermissionDenied', handlePermissionDenied)
      audioEngine.events.off('DeviceChanged', handleDeviceChanged)
      audioEngine.events.off('DevicesUpdated', handleDevicesUpdated)

      audioEngine.events.off('TranscriptUpdated', handleTranscriptUpdated)
      audioEngine.events.off('SpeechActive', handleSpeechActive)
      audioEngine.events.off('SilenceDetected', handleSilenceDetected)
    }
  }, [language])

  // Register auto-updater IPC event listeners
  useEffect(() => {
    const removeChecking = window.api.onUpdateChecking(() => {
      setUpdateState('checking')
      setUpdateErrorMessage('')
    })

    const removeAvailable = window.api.onUpdateAvailable((info: any) => {
      setUpdateState('available')
      setAvailableUpdateInfo(info)
    })

    const removeNotAvailable = window.api.onUpdateNotAvailable(() => {
      setUpdateState('not-available')
      setTimeout(() => setUpdateState('idle'), 4000)
    })

    const removeProgress = window.api.onUpdateProgress((progress: any) => {
      setUpdateState('downloading')
      setUpdateProgress(progress)
    })

    const removeDownloaded = window.api.onUpdateDownloaded((info: any) => {
      setUpdateState('downloaded')
      setAvailableUpdateInfo(info)
    })

    const removeError = window.api.onUpdateError((errMsg: string) => {
      setUpdateState('error')
      setUpdateErrorMessage(errMsg)
    })

    return () => {
      removeChecking()
      removeAvailable()
      removeNotAvailable()
      removeProgress()
      removeDownloaded()
      removeError()
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
        updateDeviceLabel(audioEngine.devices.getSelectedDeviceId(), list)
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

  const updateDeviceLabel = (deviceId: string, list: AudioInputDevice[]) => {
    const matched = list.find(d => d.deviceId === deviceId)
    if (matched) {
      setSelectedDeviceLabel(matched.label)
    } else {
      setSelectedDeviceLabel(deviceId === 'default' ? 'Default Microphone' : 'Selected Mic')
    }
  }

  // Model Download triggers
  const handleStartModelDownload = async () => {
    try {
      setDownloadState({ isDownloading: true, type: 'model', percent: 0 })
      await window.api.downloadModel(wizardModelId)
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleCancelDownload = () => {
    window.api.cancelDownload()
    setDownloadState({ isDownloading: false, type: 'model', percent: 0 })
  }

  // Handle Startup status switch click
  const handleToggleStartup = async () => {
    const nextStatus = !launchAtStartup
    const success = await window.api.toggleStartup(nextStatus)
    if (success) {
      setLaunchAtStartup(nextStatus)
    }
  }

  // Handle Microphone device selection change
  const handleDeviceSelect = async (deviceId: string) => {
    await audioEngine.devices.selectDevice(deviceId)
  }

  // Toggle Dictation session
  const handleMicClick = async () => {
    if (!isWhisperReady) {
      return
    }

    if (micState === 'idle') {
      try {
        setDuration(0)
        setLiveLevel(0)
        setLiveTranscript('')
        setIsSpeaking(false)
        setIsVadSilenced(false)
        setTargetWindow(null)

        // Reset the typing buffer session
        window.api.resetInputSession()
        
        // Grab foreground active window metadata before focus shifts
        const win = await window.api.getActiveWindow()
        setTargetWindow(win)

        await audioEngine.startRecording()
        setMicState('recording')
        
        const activeSession = audioEngine.recorder.getSession()
        if (activeSession) {
          speechEngine.startSession(activeSession.id)
        }
      } catch (err) {
        console.error('Failed to start recording session:', err)
      }
    }
  }

  // Control Actions
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

  const handleStopRecording = async () => {
    // 1. Stop audio capture
    await audioEngine.stopRecording()
    setMicState('idle')
    setIsSpeaking(false)
    setIsVadSilenced(false)

    // 2. Compile final transcription
    const finalText = await speechEngine.stopSession()

    // 3. Trigger final paste strategy insertion
    if (finalText && finalText.trim().length > 0) {
      await window.api.injectTextInput(finalText, true) // isFinal = true
      
      setHistoryItems(prev => [
        {
          id: Date.now(),
          text: finalText,
          time: 'Just now'
        },
        ...prev
      ])
    }
  }

  const handleCancelRecording = () => {
    audioEngine.cancelRecording()
    speechEngine.cancelSession()
    setMicState('idle')
    setIsSpeaking(false)
    setIsVadSilenced(false)
  }

  const handleRetryPermission = async () => {
    setShowPermissionError(false)
    setMicState('idle')
    await handleMicClick()
  }

  const handleOpenSystemSettings = () => {
    window.api.openSystemSettings()
  }

  const deleteHistoryItem = (id: number) => {
    setHistoryItems((prev) => prev.filter(item => item.id !== id))
  }

  // Timer Formatter helper
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Wizard details selector
  const selectedModelDetails = modelsList.find(m => m.id === wizardModelId)

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } 
    },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.18, ease: "easeIn" as const } 
    }
  }

  return (
    <div className="relative w-screen h-screen p-2.5 flex items-center justify-center bg-transparent overflow-hidden">
      {/* Animated Liquid Background behind the Glass Container */}
      <AnimatedBackground />

      <AnimatePresence 
        onExitComplete={() => {
          if (isFadingOut) {
            window.api.notifyHideComplete()
          }
        }}
      >
        {!isOnboardingCompleted ? (
          <OnboardingWizard 
            onComplete={() => {
              localStorage.setItem('voicefloo-onboarding-completed', 'true')
              setIsOnboardingCompleted(true)
            }}
          />
        ) : (
          isRendered && !isFadingOut && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            exit="exit"
            className="w-full h-full relative"
          >
            {/* Main Glass Panel Card */}
            <GlassCard className="w-full h-full flex flex-col justify-between select-none">
              
              {/* Top title bar */}
              <TitleBar />

              {/* Dynamic content view wrapper */}
              <div className="relative flex-1 overflow-hidden">
                
                <AnimatePresence mode="sync">
                  {/* Overlay 1: Settings Panel */}
                  {showSettings && (
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                      className="absolute inset-0 bg-[#0F1422]/95 backdrop-blur-2xl z-40 flex flex-col p-6 overflow-y-auto"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <button 
                          onClick={() => setShowSettings(false)}
                          className="p-1.5 rounded-full hover:bg-white/5 text-white/70 hover:text-white cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h2 className="text-md font-bold text-white tracking-wide">Settings</h2>
                      </div>

                      {/* Settings list */}
                      <div className="space-y-5 text-left flex-1">
                        
                        {/* Settings Item: Global Shortcut */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Global Toggle Shortcut</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={shortcut} 
                              onChange={(e) => setShortcut(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50" 
                            />
                          </div>
                        </div>

                        {/* Settings Item: Launch on Startup */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Launch on Startup</label>
                            <p className="text-[10px] text-white/50">Start VoiceFloo automatically when you log in</p>
                          </div>
                          <button 
                            onClick={handleToggleStartup} 
                            className="text-blue-400 hover:text-blue-300 cursor-pointer"
                          >
                            {launchAtStartup ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                          </button>
                        </div>

                        {/* Settings Item: Input Microphone selection */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Input Microphone</label>
                          <select
                            value={selectedDeviceId}
                            onChange={(e) => handleDeviceSelect(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                          >
                            {devicesList.length === 0 ? (
                              <option value="default" className="bg-[#0F1422]">Default Microphone</option>
                            ) : (
                              devicesList.map((device) => (
                                <option key={device.deviceId} value={device.deviceId} className="bg-[#0F1422]">
                                  {device.label}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        {/* Settings Item: Active AI Model */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Active AI Model</label>
                          <select
                            value={activeModelId}
                            onChange={(e) => {
                              setActiveModelId(e.target.value)
                              const selected = modelsList.find(m => m.id === e.target.value)
                              if (selected && !selected.installed) {
                                setWizardModelId(selected.id)
                                setIsWhisperReady(false)
                              }
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                          >
                            {modelsList.map((model) => (
                              <option key={model.id} value={model.id} className="bg-[#0F1422]">
                                {model.name} {model.installed ? '(Installed)' : '(Download required)'}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Settings Item: Input Insertion Strategy */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Typing Insertion Strategy</label>
                          <select
                            value={inputStrategy}
                            onChange={(e) => setInputStrategy(e.target.value as any)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                          >
                            <option value="auto" className="bg-[#0F1422]">Automatic Selection (Recommended)</option>
                            <option value="keyboard" className="bg-[#0F1422]">Native Keyboard Emulation (Live Streaming)</option>
                            <option value="clipboard" className="bg-[#0F1422]">Clipboard Copy-Paste (Instant Overlays)</option>
                          </select>
                        </div>

                        {/* Settings Item: Voice Commands Toggle */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Voice Commands</label>
                            <p className="text-[10px] text-white/50">Execute shortcuts like "new line" vocally</p>
                          </div>
                          <button 
                            onClick={() => setVoiceCommandsEnabled(!voiceCommandsEnabled)} 
                            className="text-blue-400 hover:text-blue-300 cursor-pointer"
                          >
                            {voiceCommandsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                          </button>
                        </div>

                        {/* Settings Item: Auto Restore Clipboard Toggle */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Auto Restore Clipboard</label>
                            <p className="text-[10px] text-white/50">Restore original clipboard content after pasting transcripts</p>
                          </div>
                          <button 
                            onClick={() => setAutoRestoreClipboard(!autoRestoreClipboard)} 
                            className="text-blue-400 hover:text-blue-300 cursor-pointer"
                          >
                            {autoRestoreClipboard ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                          </button>
                        </div>

                        {/* Settings Item: Typing Delay Speed */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <div className="flex justify-between text-[10px] font-bold text-white/40 tracking-wider uppercase">
                            <span>Character Typing Delay</span>
                            <span className="text-blue-400">{typingSpeed} ms</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            value={typingSpeed} 
                            onChange={(e) => setTypingSpeed(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                          />
                        </div>

                        {/* Settings Item: Startup Delay Before Typing */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <div className="flex justify-between text-[10px] font-bold text-white/40 tracking-wider uppercase">
                            <span>Startup Delay Before Typing</span>
                            <span className="text-blue-400">{delayBeforeTyping} ms</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="200" 
                            value={delayBeforeTyping} 
                            onChange={(e) => setDelayBeforeTyping(Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                          />
                        </div>

                        {/* Settings Item: VAD Toggle */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Silence Detection (VAD)</label>
                            <p className="text-[10px] text-white/50">Auto-pause transcription when silence is detected</p>
                          </div>
                          <button 
                            onClick={() => setVadEnabled(!vadEnabled)} 
                            className="text-blue-400 hover:text-blue-300 cursor-pointer"
                          >
                            {vadEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                          </button>
                        </div>

                        {/* Settings Item: CPU Threads */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Inference CPU Threads</label>
                          <select
                            value={cpuThreads}
                            onChange={(e) => setCpuThreads(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                          >
                            {[2, 4, 6, 8, 12].map(t => (
                              <option key={t} value={t} className="bg-[#0F1422]">{t} Threads</option>
                            ))}
                          </select>
                        </div>

                        {/* Settings Item: AI formatting Mode */}
                        <div className="space-y-1.5 border-b border-white/5 pb-4">
                          <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">AI Post-Processing</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Raw text', 'Smart Format', 'Bullet Points'].map((mode) => (
                              <button
                                key={mode}
                                onClick={() => setAiMode(mode)}
                                className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all duration-200 ${
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

                        {/* Settings Item: Transcription Language */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Transcription Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                          >
                            <option value="AUTO" className="bg-[#0F1422]">Auto Detect Language</option>
                            <option value="EN" className="bg-[#0F1422]">English</option>
                            <option value="ES" className="bg-[#0F1422]">Spanish (Español)</option>
                            <option value="FR" className="bg-[#0F1422]">French (Français)</option>
                            <option value="DE" className="bg-[#0F1422]">German (Deutsch)</option>
                            <option value="JA" className="bg-[#0F1422]">Japanese (日本語)</option>
                            <option value="ZH" className="bg-[#0F1422]">Chinese (中文)</option>
                            <option value="HI" className="bg-[#0F1422]">Hindi (हिन्दी)</option>
                            <option value="KN" className="bg-[#0F1422]">Kannada (ಕನ್ನಡ)</option>
                            <option value="UR" className="bg-[#0F1422]">Urdu (اردو)</option>
                          </select>
                        </div>

                        {/* Settings Group: Auto Updates */}
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Check For Updates</label>
                              <p className="text-[10px] text-white/50">Automatically check for updates on startup</p>
                            </div>
                            <button 
                              onClick={() => setAutoCheckUpdates(!autoCheckUpdates)} 
                              className="text-blue-400 hover:text-blue-300 cursor-pointer"
                            >
                              {autoCheckUpdates ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Auto Download Updates</label>
                              <p className="text-[10px] text-white/50">Automatically download updates in the background</p>
                            </div>
                            <button 
                              onClick={() => setAutoDownloadUpdates(!autoDownloadUpdates)} 
                              className="text-blue-400 hover:text-blue-300 cursor-pointer"
                            >
                              {autoDownloadUpdates ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                            </button>
                          </div>

                          <div className="space-y-1.5 border-b border-white/5 pb-4">
                            <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase">Release Channel</label>
                            <select
                              value={releaseChannel}
                              onChange={(e) => setReleaseChannel(e.target.value as any)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                            >
                              <option value="stable" className="bg-[#0F1422]">Stable (Recommended)</option>
                              <option value="beta" className="bg-[#0F1422]">Beta (Pre-release testing)</option>
                              <option value="dev" className="bg-[#0F1422]">Development (Bleeding-edge builds)</option>
                            </select>
                          </div>

                          {/* Live Update Status View */}
                          <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white/40 uppercase">Update Status</span>
                              <span className="text-[10px] text-white/60 font-semibold font-mono">v1.0.0</span>
                            </div>

                            {updateState === 'idle' && (
                              <button
                                onClick={() => window.api.checkForUpdates(true)}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                              >
                                Check for Updates
                              </button>
                            )}

                            {updateState === 'checking' && (
                              <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-white/50">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                <span>Checking for updates...</span>
                              </div>
                            )}

                            {updateState === 'available' && (
                              <div className="space-y-2">
                                <p className="text-[11px] text-blue-300 font-semibold">
                                  New version v{availableUpdateInfo?.version} is available!
                                </p>
                                <button
                                  onClick={() => window.api.downloadUpdate()}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                                >
                                  Download Update
                                </button>
                              </div>
                            )}

                            {updateState === 'downloading' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase">
                                  <span>Downloading update</span>
                                  <span>{updateProgress?.percent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                    style={{ width: `${updateProgress?.percent || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {updateState === 'downloaded' && (
                              <div className="space-y-2">
                                <p className="text-[11px] text-emerald-400 font-semibold">
                                  Version v{availableUpdateInfo?.version} downloaded successfully!
                                </p>
                                <button
                                  onClick={() => window.api.installAndRestartUpdate()}
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                                >
                                  Restart & Install Update
                                </button>
                              </div>
                            )}

                            {updateState === 'not-available' && (
                              <p className="text-[10px] text-emerald-400 font-bold tracking-wide uppercase text-center animate-pulse">
                                VoiceFloo is up to date!
                              </p>
                            )}

                            {updateState === 'error' && (
                              <div className="space-y-2">
                                <p className="text-[10px] text-red-400 leading-normal">
                                  {updateErrorMessage}
                                </p>
                                <button
                                  onClick={() => window.api.checkForUpdates(true)}
                                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                                >
                                  Retry Update Check
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Footer disclaimer */}
                      <div className="text-[9px] text-white/20 text-center mt-6">
                        VoiceFloo v1.0.0 • Free & Open Source
                      </div>
                    </motion.div>
                  )}

                  {/* Overlay 2: History Panel */}
                  {showHistory && (
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                      className="absolute inset-0 bg-[#0F1422]/95 backdrop-blur-2xl z-40 flex flex-col p-6 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setShowHistory(false)}
                            className="p-1.5 rounded-full hover:bg-white/5 text-white/70 hover:text-white cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <h2 className="text-md font-bold text-white tracking-wide">History</h2>
                        </div>
                        {historyItems.length > 0 && (
                          <button 
                            onClick={() => setHistoryItems([])}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Clear All
                          </button>
                        )}
                      </div>

                      {/* History list */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left">
                        {historyItems.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center text-white/30 space-y-2">
                            <Clock className="w-8 h-8 opacity-40" />
                            <p className="text-xs">No transcription history yet</p>
                          </div>
                        ) : (
                          historyItems.map((item) => (
                            <div 
                              key={item.id}
                              className="group relative p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                            >
                              <p className="text-xs text-white/80 line-clamp-4 leading-relaxed pr-6 select-text">
                                "{item.text}"
                              </p>
                              <div className="flex items-center justify-between mt-2.5">
                                <span className="text-[9px] text-white/30 font-medium">{item.time}</span>
                                <button 
                                  onClick={() => deleteHistoryItem(item.id)}
                                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-opacity duration-150 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Overlay 3: Permission Denied Error Panel */}
                  {showPermissionError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-[#0F1422]/98 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center select-none"
                    >
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center mb-5 text-red-400">
                        <AlertCircle className="w-9 h-9 stroke-[1.5]" />
                      </div>
                      
                      <h3 className="text-md font-bold text-white tracking-wide">
                        Microphone Access Denied
                      </h3>
                      
                      <p className="text-xs text-white/50 max-w-[280px] leading-relaxed mt-2.5">
                        VoiceFloo needs access to your microphone to capture dictation. Please enable microphone permissions inside your operating system settings.
                      </p>

                      <div className="flex flex-col gap-2.5 w-full max-w-[240px] mt-7">
                        <button
                          onClick={handleRetryPermission}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-900/30"
                        >
                          Retry Access
                        </button>
                        
                        <button
                          onClick={handleOpenSystemSettings}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
                        >
                          Open System Settings
                        </button>

                        <button
                          onClick={() => {
                            setShowPermissionError(false)
                            setMicState('idle')
                          }}
                          className="text-xs text-white/30 hover:text-white/60 font-semibold mt-1 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Overlay 4: SETUP WIZARD FOR OFFLINE WHISPER AI SETUP */}
                  {!isWhisperReady && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#0F1422]/99 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-6 text-center select-none"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/25 via-cyan-400/25 to-purple-500/25 border border-white/10 flex items-center justify-center mb-5 text-blue-300 shadow-xl">
                        <Sparkles className="w-8 h-8 text-blue-300" />
                      </div>

                      <h2 className="text-md font-bold text-white tracking-wide">Offline AI Setup Wizard</h2>
                      <p className="text-[11px] text-white/50 max-w-[280px] leading-relaxed mt-2">
                        VoiceFloo compiles and transcribes your audio completely offline. To start dictating, we need to install the core speech engine.
                      </p>

                      {downloadState.isDownloading ? (
                        <div className="w-full max-w-[240px] mt-8 space-y-3.5">
                          <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wide">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                              {downloadState.type === 'binary' ? 'Downloading Engine' : 'Downloading Model'}
                            </span>
                            <span>{downloadState.percent}%</span>
                          </div>
                          
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${downloadState.percent}%` }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>

                          <p className="text-[9px] text-white/35 leading-normal text-left">
                            {downloadState.type === 'binary' 
                              ? 'Downloading pre-compiled whisper-blas-x64 binary executables from GitHub...' 
                              : `Fetching GGML ${wizardModelId} model from Hugging Face servers (~${selectedModelDetails?.size})...`}
                          </p>

                          <button
                            onClick={handleCancelDownload}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase pt-2.5 cursor-pointer block mx-auto"
                          >
                            Cancel Installation
                          </button>
                        </div>
                      ) : (
                        <div className="w-full max-w-[250px] mt-6 space-y-4 text-left">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Select Whisper Model</label>
                            <select
                              value={wizardModelId}
                              onChange={(e) => setWizardModelId(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                            >
                              {modelsList.map((m) => (
                                <option key={m.id} value={m.id} className="bg-[#0F1422]">
                                  {m.name} ({m.size})
                                </option>
                              ))}
                            </select>
                          </div>

                          {selectedModelDetails && (
                            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1.5 text-[9px] select-text">
                              <div className="flex justify-between"><span className="text-white/40 font-semibold">Download Size:</span><span className="text-white font-bold">{selectedModelDetails.size}</span></div>
                              <div className="flex justify-between"><span className="text-white/40 font-semibold">Inference RAM:</span><span className="text-white font-bold">{selectedModelDetails.ramUsage}</span></div>
                              <div className="flex justify-between"><span className="text-white/40 font-semibold">Inference Speed:</span><span className="text-cyan-400 font-bold">{selectedModelDetails.estimatedSpeed}</span></div>
                            </div>
                          )}

                          <button
                            onClick={handleStartModelDownload}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-900/30 text-center"
                          >
                            Download & Initialize
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main View Container */}
                <div className="w-full h-full flex flex-col items-center justify-between py-6">
                  
                  {/* Top Info Header */}
                  <div className="flex flex-col items-center gap-3 pt-2 z-30 select-none">
                    <motion.div
                      className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/20 via-cyan-400/20 to-purple-500/20 border border-white/10 shadow-lg"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                    >
                      <div className="absolute inset-0.5 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />
                      <Sparkles className="w-7 h-7 text-blue-300/80" />
                    </motion.div>
                    
                    <div className="text-center">
                      <h1 className="text-lg font-bold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                        VoiceFloo
                      </h1>
                      <p className="text-[9px] text-white/30 font-bold tracking-widest uppercase mt-0.5">
                        AI Voice Dictation
                      </p>
                    </div>

                    <StatusIndicator state={micState} />
                  </div>

                  {/* Middle Section (Microphone toggle or Waveform recorder) */}
                  <div className="flex-1 w-full flex flex-col items-center justify-center p-4 z-30">
                    <AnimatePresence mode="wait">
                      {micState === 'idle' || micState === 'error' ? (
                        <motion.div
                          key="idle-layout"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center"
                        >
                          <FloatingMicButton state={micState} onClick={handleMicClick} />
                          
                          <div className="w-full mt-7 min-h-[50px] flex flex-col items-center justify-center text-center px-4">
                            <p className="text-xs font-semibold text-white/70">
                              Click microphone to start dictation
                            </p>
                            <p className="text-[10px] text-white/30 max-w-[280px] leading-relaxed mt-1.5">
                              VoiceFloo runs safely in the background. Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/50 text-[9px] font-mono border border-white/5">Opt + Space</kbd> to record instantly.
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="recording-layout"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center space-y-4 w-full max-w-[280px]"
                        >
                          {/* Live Volume Waveform */}
                          <VisualWaveform level={liveLevel} isPaused={micState === 'paused'} />

                          {/* Live Transcription Box */}
                          <div className="w-full h-24 overflow-y-auto p-3.5 border border-white/5 bg-white/[0.01] rounded-2xl text-left select-text relative">
                            {liveTranscript ? (
                              <p className="text-xs text-white/95 leading-relaxed font-medium">
                                {liveTranscript}
                              </p>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center text-white/30 space-y-1.5 select-none">
                                <motion.span
                                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="text-xs font-semibold tracking-wide"
                                >
                                  {isVadSilenced ? 'Auto-paused (Silence detected)' : 'Listening... Speak now'}
                                </motion.span>
                              </div>
                            )}
                          </div>

                          {/* Recording status, Timer, and VAD */}
                          <div className="flex items-center justify-between w-full px-1 text-xs select-none">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${micState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                              <span className="text-[10px] font-bold text-white/50 font-mono select-text">
                                {formatTimer(duration)}
                              </span>
                            </div>
                            
                            {/* Confidence / VAD Indicator */}
                            <div className="text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.03] uppercase">
                              {isSpeaking ? (
                                <span className="text-emerald-400">Speech Active</span>
                              ) : isVadSilenced ? (
                                <span className="text-amber-400/80">Silenced</span>
                              ) : (
                                <span className="text-white/40">Ready</span>
                              )}
                            </div>
                          </div>

                          {/* Target window application name */}
                          {targetWindow && (
                            <div className="text-[9px] text-white/35 font-bold tracking-wider flex items-center justify-between w-full px-1 bg-white/[0.02] border border-white/5 py-1 px-3.5 rounded-xl uppercase select-none">
                              <div className="flex items-center gap-1.5">
                                {inputStrategy === 'clipboard' ? (
                                  <Clipboard className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                                )}
                                <span className="max-w-[100px] truncate">
                                  To: {targetWindow.executable.replace('.exe', '')}
                                </span>
                              </div>
                              <span className="max-w-[100px] truncate text-[8px] text-white/50 lowercase">Mic: {selectedDeviceLabel}</span>
                              <span className="text-blue-300 font-semibold">{language} • {activeModelId.toUpperCase()}</span>
                            </div>
                          )}

                          {/* Controls bar */}
                          <div className="flex items-center gap-3.5 pt-1.5">
                            {/* Cancel / Discard */}
                            <GlassButton
                              onClick={handleCancelRecording}
                              title="Cancel and Discard Recording"
                              className="w-10 h-10 rounded-full text-white/50 hover:text-red-400 border-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </GlassButton>

                            {/* Pause / Resume toggle */}
                            {micState === 'recording' ? (
                              <GlassButton
                                onClick={handlePauseRecording}
                                title="Pause Session"
                                className="px-4.5 h-10 rounded-full text-[10px] font-bold tracking-wider gap-1.5"
                              >
                                <Pause className="w-3.5 h-3.5 text-amber-400" />
                                <span>PAUSE</span>
                              </GlassButton>
                            ) : (
                              <GlassButton
                                onClick={handleResumeRecording}
                                title="Resume Session"
                                className="px-4.5 h-10 rounded-full text-[10px] font-bold tracking-wider gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-400" />
                                <span>RESUME</span>
                              </GlassButton>
                            )}

                            {/* Stop and Save */}
                            <GlassButton
                              onClick={handleStopRecording}
                              title="Finish and Compile Audio Chunks"
                              className="w-10 h-10 rounded-full bg-blue-600/15 border-blue-500/30 text-blue-300 hover:bg-blue-600/25 hover:text-white"
                            >
                              <Check className="w-4.5 h-4.5" />
                            </GlassButton>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Simulator action triggers */}
                  {(micState === 'idle' || micState === 'error') && (
                    <div className="flex items-center gap-2 mb-2 z-30 select-none">
                      <button 
                        onClick={() => setShowPermissionError(true)}
                        className="px-2 py-1 text-[9px] font-bold rounded border border-white/5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 cursor-pointer transition-colors"
                      >
                        Simulate Denied Permission
                      </button>
                      <button 
                        onClick={() => setIsWhisperReady(false)}
                        className="px-2 py-1 text-[9px] font-bold rounded border border-white/5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 cursor-pointer transition-colors"
                      >
                        Trigger Setup Wizard
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Toolbar with Settings / History triggers */}
              <BottomToolbar 
                onSettingsClick={() => setShowSettings(true)}
                onHistoryClick={() => setShowHistory(true)}
                onLanguageChange={(lang) => setLanguage(lang)}
              />
              
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default App
