import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mic, ToggleLeft, ToggleRight, ArrowRight, ArrowLeft, Shield, Play, Pause, Check, CheckCircle2, Download, Keyboard, Languages, Loader2 } from 'lucide-react'
import { GlassCard } from '../GlassCard'
import { GlassButton } from '../GlassButton'
import { audioEngine } from '../../services/audio/audio-engine'
import { AudioInputDevice } from '../../services/audio/audio-device-manager'
import { speechEngine } from '../../services/speech/speech-engine'

// Micro-components inside same module for clean, unified onboarding state management
interface VisualWaveformProps {
  level: number
  isPaused: boolean
}

const VisualWaveformOnboarding: React.FC<VisualWaveformProps> = ({ level, isPaused }) => {
  const [heights, setHeights] = useState<number[]>(new Array(11).fill(4))

  useEffect(() => {
    if (isPaused) {
      setHeights(new Array(11).fill(4))
      return
    }

    const interval = setInterval(() => {
      setHeights(() => {
        return Array.from({ length: 11 }).map((_, i) => {
          const factor = Math.sin((i / 10) * Math.PI)
          const randomFactor = 0.5 + Math.random() * 0.5
          const height = 4 + level * 50 * factor * randomFactor
          return Math.max(4, Math.min(54, height))
        })
      })
    }, 20)

    return () => clearInterval(interval)
  }, [level, isPaused])

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 select-none bg-white/[0.01] border border-white/5 rounded-xl px-4 py-2 w-full max-w-[200px]">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-blue-400"
          animate={{ height: h }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      ))}
    </div>
  )
}

interface OnboardingWizardProps {
  onComplete: () => void
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0)

  // Configuration States
  const [isMicGranted, setIsMicGranted] = useState(false)
  const [isStartupEnabled, setIsStartupEnabled] = useState(false)
  const [language, setLanguage] = useState('EN')
  const [devicesList, setDevicesList] = useState<AudioInputDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('default')
  
  // Model States
  const [modelsList, setModelsList] = useState<any[]>([])
  const [selectedModelId, setSelectedModelId] = useState('base')
  const [downloadState, setDownloadState] = useState({
    isDownloading: false,
    percent: 0,
    type: 'model'
  })

  // Mic test audio level
  const [testLevel, setTestLevel] = useState(0)

  // Sandbox dictation states
  const [sandboxMicState, setSandboxMicState] = useState<'idle' | 'recording' | 'paused'>('idle')
  const [sandboxTranscript, setSandboxTranscript] = useState('')
  const [sandboxLevel, setSandboxLevel] = useState(0)

  // Keybind States
  const [shortcutKey, setShortcutKey] = useState('Ctrl + Shift + Space')
  const [isRecordingKeys, setIsRecordingKeys] = useState(false)

  // Read current system profiles on mount
  useEffect(() => {
    // Permission check
    audioEngine.permissions.checkPermission().then((state) => {
      setIsMicGranted(state === 'granted')
      if (state === 'granted') {
        audioEngine.devices.refreshDevices().then((list) => {
          setDevicesList(list)
          setSelectedDeviceId(audioEngine.devices.getSelectedDeviceId())
        })
      }
    })

    window.api.getModelsList().then((list) => {
      setModelsList(list)
    })

    window.api.getStartupStatus().then((status) => {
      setIsStartupEnabled(status)
    })

    // Setup active listeners for model downloader
    const unsubProgress = window.api.onDownloadProgress((data) => {
      setDownloadState({
        isDownloading: true,
        percent: data.percent,
        type: data.type
      })
    })

    const unsubSuccess = window.api.onDownloadSuccess((modelId) => {
      setDownloadState({ isDownloading: false, percent: 100, type: 'model' })
      // Re-fetch model installation states
      window.api.getModelsList().then((list) => {
        setModelsList(list)
        const matched = list.find((m) => m.id === modelId)
        if (matched) matched.installed = true
      })
    })

    const unsubError = window.api.onDownloadError((err) => {
      setDownloadState({ isDownloading: false, percent: 0, type: 'model' })
      alert(`Model installation failed: ${err}`)
    })

    return () => {
      unsubProgress()
      unsubSuccess()
      unsubError()
    }
  }, [])

  // Hook audio listeners for mic testing in Step 5 and Step 6
  useEffect(() => {
    const handleLevelChanged = (level: number) => {
      if (step === 4) {
        setTestLevel(level)
      } else if (step === 5) {
        setSandboxLevel(level)
      }
    }

    const handleTranscriptUpdated = (text: string) => {
      if (step === 5) {
        setSandboxTranscript(text)
      }
    }

    audioEngine.events.on('AudioLevelChanged', handleLevelChanged)
    audioEngine.events.on('TranscriptUpdated', handleTranscriptUpdated)

    return () => {
      audioEngine.events.off('AudioLevelChanged', handleLevelChanged)
      audioEngine.events.off('TranscriptUpdated', handleTranscriptUpdated)
    }
  }, [step])

  // Custom keybind capturing listener
  useEffect(() => {
    if (!isRecordingKeys) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const keys: string[] = []
      if (e.ctrlKey) keys.push('Ctrl')
      if (e.shiftKey) keys.push('Shift')
      if (e.altKey) keys.push('Alt')
      if (e.metaKey) keys.push('Win')

      const keyName = e.key.toUpperCase()
      if (keyName !== 'CONTROL' && keyName !== 'SHIFT' && keyName !== 'ALT' && keyName !== 'META') {
        keys.push(keyName)
      }

      if (keys.length > 0) {
        setShortcutKey(keys.join(' + '))
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isRecordingKeys])

  // 1. Welcome Trigger
  const handleNextStep = () => {
    // Before switching steps, make sure to clean up any active audio test listeners
    cleanupAudioTesting()
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    cleanupAudioTesting()
    setStep((prev) => prev - 1)
  }

  const cleanupAudioTesting = () => {
    if (sandboxMicState !== 'idle') {
      audioEngine.cancelRecording()
      speechEngine.cancelSession()
      setSandboxMicState('idle')
    }
    // Release active mic checks
    audioEngine.level.reset()
    setTestLevel(0)
    setSandboxLevel(0)
  }

  // 2. Request Mic Permission
  const handleRequestMic = async () => {
    const granted = await audioEngine.permissions.requestPermission()
    setIsMicGranted(granted)
    if (granted) {
      const list = await audioEngine.devices.refreshDevices()
      setDevicesList(list)
      setSelectedDeviceId(audioEngine.devices.getSelectedDeviceId())
    }
  }

  const handleToggleStartup = async () => {
    const nextVal = !isStartupEnabled
    const success = await window.api.toggleStartup(nextVal)
    if (success) {
      setIsStartupEnabled(nextVal)
    }
  }

  // 3. Download base model
  const handleDownloadModel = async () => {
    try {
      setDownloadState({ isDownloading: true, percent: 0, type: 'model' })
      await window.api.downloadModel(selectedModelId)
    } catch (err) {
      console.error(err)
    }
  }

  // 4. Test Microphone levels
  const [isTestingMic, setIsTestingMic] = useState(false)
  
  const handleToggleMicTest = async () => {
    if (isTestingMic) {
      await audioEngine.stopRecording()
      setIsTestingMic(false)
      setTestLevel(0)
    } else {
      try {
        await audioEngine.startRecording()
        setIsTestingMic(true)
      } catch (err) {
        console.error(err)
      }
    }
  }

  // 5. Test Dictation sandbox
  const handleToggleSandboxRecord = async () => {
    if (sandboxMicState === 'idle') {
      try {
        setSandboxTranscript('')
        setSandboxLevel(0)
        
        await audioEngine.startRecording()
        setSandboxMicState('recording')
        
        const session = audioEngine.recorder.getSession()
        if (session) {
          speechEngine.startSession(session.id)
        }
      } catch (err) {
        console.error(err)
      }
    } else if (sandboxMicState === 'recording') {
      audioEngine.pauseRecording()
      speechEngine.pauseRecording()
      setSandboxMicState('paused')
      setSandboxLevel(0)
    } else {
      audioEngine.resumeRecording()
      speechEngine.resumeRecording()
      setSandboxMicState('recording')
    }
  }

  const handleStopSandboxRecord = async () => {
    await audioEngine.stopRecording()
    setSandboxMicState('idle')
    setSandboxLevel(0)
    
    const text = await speechEngine.stopSession()
    if (text) {
      setSandboxTranscript(text)
    }
  }

  const handleClearSandbox = () => {
    if (sandboxMicState !== 'idle') {
      audioEngine.cancelRecording()
      speechEngine.cancelSession()
      setSandboxMicState('idle')
    }
    setSandboxTranscript('')
    setSandboxLevel(0)
  }

  // Compile setup profiles and complete onboarding
  const handleFinishOnboarding = () => {
    cleanupAudioTesting()
    
    // Sync selections back to the settings profiles
    speechEngine.setOptions({
      modelId: selectedModelId,
      language: language.toLowerCase() === 'auto' ? 'auto' : language.toLowerCase()
    })
    
    audioEngine.devices.selectDevice(selectedDeviceId)
    
    // Fire callback triggers
    onComplete()
  }

  // Metadata details helper
  const selectedModel = modelsList.find((m) => m.id === selectedModelId)

  // Layout page transition animations
  const pageVariants = {
    initial: { opacity: 0, x: 25 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
    exit: { opacity: 0, x: -25, transition: { duration: 0.2 } }
  }

  return (
    <div className="absolute inset-0 bg-transparent flex items-center justify-center p-3 select-none z-50">
      <GlassCard className="w-full max-w-[340px] h-[540px] flex flex-col justify-between p-6 overflow-hidden">
        
        {/* Dynamic step visual indicators */}
        <div className="flex items-center justify-between gap-1 w-full pt-1.5 pb-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                idx === step 
                  ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                  : idx < step 
                    ? 'bg-emerald-500/70' 
                    : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Dynamic View Carousel */}
        <div className="flex-1 relative overflow-y-auto pr-1 my-3 text-left">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: WELCOME SCREEN */}
            {step === 0 && (
              <motion.div key="step-0" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500/25 via-cyan-400/25 to-purple-500/25 border border-white/10 flex items-center justify-center mx-auto shadow-xl">
                  <Sparkles className="w-9 h-9 text-blue-300 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Welcome to VoiceFloo</h2>
                  <p className="text-xs text-white/50 leading-relaxed max-w-[240px] mx-auto">
                    The fastest way to type with your voice, completely offline and private.
                  </p>
                </div>
                
                <div className="pt-8">
                  <button 
                    onClick={handleNextStep}
                    className="w-full max-w-[200px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/30 cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PERMISSION CONTROLS */}
            {step === 1 && (
              <motion.div key="step-1" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">System Permissions</h3>
                </div>

                <p className="text-[11px] text-white/55 leading-relaxed pb-2">
                  VoiceFloo requires operating system credentials to capture dictation and inject text anywhere you type.
                </p>

                {/* Microphone Card */}
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-[11px] font-bold text-white/80">Microphone Input</h4>
                    <p className="text-[9px] text-white/40">Required to capture dictation audio</p>
                  </div>
                  {isMicGranted ? (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase">Granted</span>
                  ) : (
                    <button 
                      onClick={handleRequestMic}
                      className="text-[9px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer uppercase border border-blue-500/20 px-3 py-1 rounded-lg bg-blue-500/5"
                    >
                      Grant
                    </button>
                  )}
                </div>

                {/* Startup Card */}
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-[11px] font-bold text-white/80">Launch at Startup</h4>
                    <p className="text-[9px] text-white/40">Run in tray on user login (optional)</p>
                  </div>
                  <button 
                    onClick={handleToggleStartup}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {isStartupEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: OFFLINE SPEECH MODEL */}
            {step === 2 && (
              <motion.div key="step-2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-3.5">
                <div className="flex items-center gap-2.5 pb-1">
                  <Download className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">Speech Model Setup</h3>
                </div>

                <p className="text-[11px] text-white/55 leading-relaxed">
                  VoiceFloo transcribes 100% offline. Recommend downloading the **Base Model** for balanced speed and accuracy.
                </p>

                {downloadState.isDownloading ? (
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        {downloadState.type === 'binary' ? 'Downloading Engine' : 'Downloading Model'}
                      </span>
                      <span>{downloadState.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        animate={{ width: `${downloadState.percent}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Select Model</label>
                      <select 
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                      >
                        {modelsList.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[#0F1422]">
                            {m.name} {m.installed ? '(Installed)' : `(${m.size})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedModel && (
                      <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-1.5 text-[9px]">
                        <div className="flex justify-between"><span className="text-white/40">Inference RAM:</span><span className="text-white font-bold">{selectedModel.ramUsage}</span></div>
                        <div className="flex justify-between"><span className="text-white/40">Relative Speed:</span><span className="text-cyan-400 font-bold">{selectedModel.estimatedSpeed}</span></div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Status:</span>
                          {selectedModel.installed ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Installed</span>
                          ) : (
                            <span className="text-white/50">Not downloaded</span>
                          )}
                        </div>
                      </div>
                    )}

                    {!selectedModel?.installed && (
                      <button 
                        onClick={handleDownloadModel}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-900/30"
                      >
                        Download & Verify Model
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: CHOOSE LANGUAGE */}
            {step === 3 && (
              <motion.div key="step-3" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2">
                  <Languages className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">Dictation Language</h3>
                </div>

                <p className="text-[11px] text-white/55 leading-relaxed pb-1">
                  Specify your primary speaking language or choose Auto-Detect. You can change this dynamically at any time.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Select Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="AUTO" className="bg-[#0F1422]">Auto-Detect Language</option>
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
              </motion.div>
            )}

            {/* STEP 5: MICROPHONE TEST */}
            {step === 4 && (
              <motion.div key="step-4" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <Mic className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">Microphone Test</h3>
                </div>

                <p className="text-[11px] text-white/55 leading-relaxed">
                  Verify your active audio inputs. Speak naturally to test decibel volume peaks.
                </p>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Select Input Device</label>
                    <select 
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                    >
                      {devicesList.map((d) => (
                        <option key={d.deviceId} value={d.deviceId} className="bg-[#0F1422]">{d.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={handleToggleMicTest}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        isTestingMic 
                          ? 'bg-red-500/20 border border-red-500/40 text-red-200' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isTestingMic ? 'Stop Test' : 'Test Microphone'}
                    </button>

                    {isTestingMic && (
                      <div className="flex-1 flex justify-end">
                        <VisualWaveformOnboarding level={testLevel} isPaused={false} />
                      </div>
                    )}
                  </div>

                  {testLevel > 0.05 && (
                    <p className="text-[10px] text-emerald-400 font-bold tracking-wide uppercase text-center animate-pulse">
                      Your microphone is working!
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 6: SANDBOX DICTATION TYPING TEST */}
            {step === 5 && (
              <motion.div key="step-5" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">Interactive Tryout Sandbox</h3>
                </div>

                <p className="text-[10px] text-white/55 leading-relaxed">
                  Experience offline dictation! Click the mic button below, speak, and watch text print in the sandbox.
                </p>

                {/* Sandbox text area */}
                <textarea
                  readOnly
                  placeholder="Your sandbox transcript will type out here live..."
                  value={sandboxTranscript}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/20 focus:outline-none resize-none select-text"
                />

                {/* Active Controls */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {sandboxMicState === 'idle' ? (
                      <GlassButton 
                        onClick={handleToggleSandboxRecord} 
                        className="px-4.5 h-9 rounded-xl text-[10px] font-bold text-blue-300 hover:text-white"
                      >
                        Start Dictating
                      </GlassButton>
                    ) : (
                      <>
                        <GlassButton 
                          onClick={handleToggleSandboxRecord} 
                          className="w-9 h-9 rounded-full text-amber-400"
                          title={sandboxMicState === 'recording' ? 'Pause' : 'Resume'}
                        >
                          {sandboxMicState === 'recording' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </GlassButton>

                        <GlassButton 
                          onClick={handleStopSandboxRecord} 
                          className="w-9 h-9 rounded-full bg-blue-600/10 border-blue-500/20 text-blue-300"
                          title="Finish"
                        >
                          <Check className="w-4.5 h-4.5" />
                        </GlassButton>
                      </>
                    )}
                  </div>

                  {sandboxMicState !== 'idle' && (
                    <div className="flex-1 flex justify-end">
                      <VisualWaveformOnboarding level={sandboxLevel} isPaused={sandboxMicState === 'paused'} />
                    </div>
                  )}

                  {sandboxTranscript && (
                    <button 
                      onClick={handleClearSandbox}
                      className="p-2 text-[10px] font-bold text-white/30 hover:text-red-400 transition-colors uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 7: GLOBAL HOTKEY SHORTCUT */}
            {step === 6 && (
              <motion.div key="step-6" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">Global Shortcut Activation</h3>
                </div>

                <p className="text-[11px] text-white/55 leading-relaxed">
                  Call VoiceFloo from any background app. Click the input below and press your desired hotkey combination.
                </p>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Global Toggle Keybind</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsRecordingKeys(!isRecordingKeys)}
                        className={`flex-1 text-left bg-white/5 border border-white/10 rounded-xl px-4.5 py-2.5 text-xs text-white font-mono cursor-pointer transition-colors ${
                          isRecordingKeys ? 'border-blue-500/60 bg-blue-500/5 ring-1 ring-blue-500/20' : ''
                        }`}
                      >
                        {isRecordingKeys ? 'Recording key press...' : shortcutKey}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/30 leading-normal">
                    * Make sure this combo does not conflict with active OS shortcuts (like Ctrl+C or Alt+Tab).
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 8: COMPLETION CELEBRATION */}
            {step === 7 && (
              <motion.div key="step-7" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-5 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white tracking-wide">VoiceFloo is Ready!</h2>
                  <p className="text-xs text-white/50 max-w-[240px] mx-auto leading-relaxed">
                    Onboarding complete. Speak naturally and let the dictation flow.
                  </p>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleFinishOnboarding}
                    className="w-full max-w-[200px] bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/35 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>Launch VoiceFloo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Wizard Footer controls */}
        {step > 0 && (
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Skip/Next routing */}
            {step < 7 && (
              <button
                disabled={step === 2 && !selectedModel?.installed}
                onClick={handleNextStep}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 disabled:text-white/20 disabled:pointer-events-none transition-colors cursor-pointer font-bold"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Developer shortcut to bypass onboarding during development */}
        {step === 0 && (
          <div className="text-center pt-2 select-none border-t border-white/5 pt-4">
            <button
              onClick={handleFinishOnboarding}
              className="text-[9px] font-bold text-white/25 hover:text-white/40 transition-colors uppercase tracking-widest cursor-pointer"
            >
              Bypass Onboarding (Dev)
            </button>
          </div>
        )}

      </GlassCard>
    </div>
  )
}
