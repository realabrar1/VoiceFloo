'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { 
  Sparkles, Mic, Download, Shield, Zap, Keyboard, HelpCircle, 
  ArrowRight, CheckCircle2, Languages, Clipboard, Command, 
  Terminal, MessageSquare, FileText, Check, Play, Pause, Trash2, 
  Globe, Cpu, ArrowUpRight, Loader2
} from 'lucide-react'
import Lenis from 'lenis'

// Premium Floating Dictation Overlay Mockup (Matches VoiceFloo actual app layout)
const DesktopMockup = () => {
  const [micState, setMicState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [displayText, setDisplayText] = useState('')
  const [duration, setDuration] = useState(0)
  const [liveLevel, setLiveLevel] = useState(0)

  const demoTranscript = 'Speak. Think. Flow. VoiceFloo types completely offline using local Whisper AI.'

  useEffect(() => {
    let timer: NodeJS.Timeout
    let wavTimer: NodeJS.Timeout
    let active = true

    const runDemo = async () => {
      while (active) {
        // 1. Idle state
        setMicState('idle')
        setDisplayText('')
        setDuration(0)
        setLiveLevel(0)
        await new Promise(r => setTimeout(r, 2000))
        if (!active) break

        // 2. Start Dictating
        setMicState('recording')
        let secs = 0
        timer = setInterval(() => {
          secs++
          setDuration(secs)
        }, 1000)

        // Simulate waveform level changes
        wavTimer = setInterval(() => {
          setLiveLevel(0.15 + Math.random() * 0.75)
        }, 100)

        // Type out letters sequentially to simulate live Whisper stream
        const words = demoTranscript.split(' ')
        let current = ''
        for (let i = 0; i < words.length; i++) {
          current += (i === 0 ? '' : ' ') + words[i]
          setDisplayText(current)
          await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
          if (!active) break
        }
        
        clearInterval(timer)
        clearInterval(wavTimer)
        if (!active) break

        // 3. Final compiling pass
        setMicState('processing')
        setLiveLevel(0)
        await new Promise(r => setTimeout(r, 1200))
        if (!active) break

        // 4. Finished & hidden
        setMicState('idle')
        await new Promise(r => setTimeout(r, 3500))
      }
    }

    runDemo()

    return () => {
      active = false
      clearInterval(timer)
      clearInterval(wavTimer)
    }
  }, [])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="relative w-full max-w-[340px] mx-auto select-none">
      {/* Absolute shadow glow */}
      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
      
      {/* Dictation overlay layout mockup */}
      <div className="relative premium-glass border border-white/10 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        
        <div className="flex items-center justify-between w-full">
          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${micState === 'recording' ? 'bg-red-500 animate-pulse' : micState === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-white/80 font-mono">
              {formatTimer(duration)}
            </span>
          </div>

          {/* Core Waveform */}
          <div className="flex-1 flex items-center justify-center px-3 h-8">
            {micState === 'processing' ? (
              <span className="text-[10px] font-bold text-blue-300 tracking-wider uppercase animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Processing
              </span>
            ) : micState === 'recording' ? (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => {
                  const h = 4 + liveLevel * 24 * Math.sin((i / 8) * Math.PI) * (0.6 + Math.random() * 0.4);
                  return (
                    <motion.div
                      key={i}
                      className="w-0.5 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-blue-400"
                      animate={{ height: Math.max(4, Math.min(24, h)) }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )
                })}
              </div>
            ) : (
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Idle</span>
            )}
          </div>

          {/* Mimic overlay actions */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/5">
              <Trash2 className="w-3 h-3" />
            </div>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/5">
              {micState === 'recording' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Check className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Real-time transcription box */}
        <div className="mt-3 min-h-[50px] p-2.5 rounded-xl border border-white/5 bg-white/[0.01] text-left select-text relative">
          {displayText ? (
            <p className="text-[11px] text-white/90 leading-relaxed font-semibold">
              {displayText}
              <span className="w-1.5 h-3 bg-blue-500 inline-block animate-pulse ml-0.5 align-middle" />
            </p>
          ) : (
            <p className="text-[10px] text-white/35 font-bold text-center pt-2">
              Listening...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Stats badges with smooth count-up
const StatCounter = ({ value, label, prefix = '', suffix = '' }: { value: string; label: string; prefix?: string; suffix?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    if (end === 0) return
    const duration = 2000
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <div ref={ref} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="text-3xl md:text-5xl font-black text-white font-mono tracking-tight text-gradient mb-2 select-text">
        {value.includes('<') && count === 0 ? value : `${prefix}${count}${suffix}`}
      </div>
      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  )
}

// Interactive demo depicting real workflow inside code editor
const InteractiveDemo = () => {
  const [step, setStep] = useState<'idle' | 'shortcut' | 'listening' | 'typing' | 'done'>('idle')
  const [text, setText] = useState('')
  const fullText = "const dictation = 'VoiceFloo is extremely fast and completely offline!';"

  useEffect(() => {
    let active = true
    const runSequence = async () => {
      while (active) {
        setStep('idle')
        setText('')
        await new Promise(r => setTimeout(r, 2000))
        if (!active) break

        setStep('shortcut')
        await new Promise(r => setTimeout(r, 1200))
        if (!active) break

        setStep('listening')
        await new Promise(r => setTimeout(r, 2500))
        if (!active) break

        setStep('typing')
        let displayed = ''
        for (let i = 0; i < fullText.length; i++) {
          displayed += fullText[i]
          setText(displayed)
          await new Promise(r => setTimeout(r, 50 + Math.random() * 30))
          if (!active) break
        }
        if (!active) break

        setStep('done')
        await new Promise(r => setTimeout(r, 4000))
      }
    }
    runSequence()
    return () => { active = false }
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#0F1424]/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Editor Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0B0F1C] border-b border-white/5 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <Terminal className="w-3.5 h-3.5" />
          <span>index.js — VS Code</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Editor Workspace */}
      <div className="p-6 md:p-8 min-h-[220px] font-mono text-xs md:text-sm text-left select-text relative">
        <div className="text-white/20 select-none">
          <p>1 <span className="text-blue-400">import</span> &#123; dictation &#125; <span className="text-blue-400">from</span> <span className="text-cyan-300">&apos;voicefloo-dictate&apos;</span></p>
          <p>2 </p>
          <p>3 <span className="text-white/30">// Press Ctrl + Space to trigger VoiceFloo dictation overlay</span></p>
        </div>
        
        {/* Blinking cursor line */}
        <div className="flex items-center mt-1">
          <span className="text-white/20 mr-4 select-none">4</span>
          <span className="text-slate-200">
            {text}
            <span className="w-2 h-4 bg-blue-500 inline-block animate-pulse ml-0.5" />
          </span>
        </div>

        {/* Live Floating Dictation Assistant overlay trigger representation */}
        <AnimatePresence>
          {(step === 'shortcut' || step === 'listening') && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute bottom-6 right-6 z-20 flex items-center gap-3 p-3.5 rounded-full border border-blue-500/20 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/60 select-none"
            >
              {step === 'shortcut' ? (
                <div className="flex items-center gap-2 px-2 text-xs font-bold text-white/80">
                  <Command className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>Shortcut Triggered</span>
                </div>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Listening...</span>
                  <div className="flex items-end gap-0.5 h-4 px-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-blue-400 rounded-full"
                        animate={{ height: [4, 16 * Math.sin((i / 4) * Math.PI) * (0.5 + Math.random() * 0.5), 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// FAQ Accordion Card
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/5 py-4 text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
      >
        <span>{question}</span>
        <HelpCircle className={`w-4.5 h-4.5 text-white/35 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-slate-400 leading-relaxed pt-2 pb-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Initialize Lenis Smooth Scroll on Mount
  useEffect(() => {
    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      lenis.destroy()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="w-full relative flex flex-col items-center bg-[#050816] overflow-x-hidden noise-bg">
      {/* Moving background glowing blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse-glow" />
      <div className="absolute top-[400px] right-[-100px] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[200px] left-[10%] w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse-glow" style={{ animationDelay: '4s' }} />

      {/* Interactive cursor spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(550px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.04), transparent 80%)`
        }}
      />

      {/* 1 HERO SECTION */}
      <section className="min-h-[85vh] w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between pt-24 md:pt-32 pb-16 gap-12 relative z-10">
        
        {/* Left column hero text */}
        <div className="flex-1 text-left space-y-8 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/15 bg-blue-950/10 text-[10px] font-bold tracking-widest text-cyan-400 uppercase select-none shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Offline AI Dictation</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-tighter text-white leading-[0.95] select-text">
            Speak.<br />
            Think.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-glow">Flow.</span>
          </h1>

          <p className="text-md md:text-lg text-slate-400 max-w-[500px] leading-relaxed">
            The fastest offline AI dictation assistant. VoiceFloo types natively wherever your cursor is. No cloud. No subscription. Powered by whisper.cpp.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="https://github.com/realabrar1/VoiceFloo/releases/download/v1.0.0/voicefloo-1.0.0-setup.exe"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-[13px] font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2 uppercase tracking-wider group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download for Windows</span>
            </Link>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[13px] font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider hover:border-white/20"
            >
              <span>Watch Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right column floating mockup */}
        <div className="flex-1 flex justify-center lg:justify-end w-full animate-float">
          <div className="w-full max-w-[450px] p-6 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <DesktopMockup />
          </div>
        </div>
      </section>

      {/* 2 TRUST BAR (Scrolling Marquee) */}
      <section className="w-full py-6 border-t border-b border-white/5 bg-[#070b1c]/30 backdrop-blur-md overflow-hidden relative z-10 select-none">
        <div className="animate-marquee gap-12 flex">
          {[
            '100% Offline AI',
            'Privacy First',
            'Open Source',
            'Windows Native',
            'Whisper.cpp Powered',
            'Unlimited Dictation',
            'Zero Cloud Upload',
            'Global Hotkeys'
          ].map((trust, idx) => (
            <div key={idx} className="flex items-center gap-3 px-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-widest text-white/40 uppercase">{trust}</span>
            </div>
          ))}
          {/* Double list for smooth seamless loop wrap */}
          {[
            '100% Offline AI',
            'Privacy First',
            'Open Source',
            'Windows Native',
            'Whisper.cpp Powered',
            'Unlimited Dictation',
            'Zero Cloud Upload',
            'Global Hotkeys'
          ].map((trust, idx) => (
            <div key={idx + 10} className="flex items-center gap-3 px-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-widest text-white/40 uppercase">{trust}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 FEATURES SECTION */}
      <section className="max-w-7xl w-full mx-auto px-6 py-24 md:py-32 text-center relative z-10">
        <div className="max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Designed for Privacy & Speed
          </h2>
          <p className="text-sm text-slate-400">
            VoiceFloo brings state of the art speech recognition models to your device. No clouds. No leaks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Cpu, glow: 'glow-blue', title: 'Offline AI', desc: 'Runs fully local Whisper voice models directly on your hardware. Works without internet connections.' },
            { icon: Shield, glow: 'glow-cyan', title: 'Privacy First', desc: 'No transcripts, sound inputs, or logs are uploaded. Your sound files never leave your computer.' },
            { icon: Keyboard, glow: 'glow-purple', title: 'Works Everywhere', desc: 'Simulates low-level hardware keystrokes to print text in VS Code, Word, Chrome, and any other window.' },
            { icon: Command, glow: 'glow-blue', title: 'Global Hotkeys', desc: 'Quickly trigger or pause recording instantly using options like Option + Space or Ctrl + Shift + Space.' },
            { icon: Zap, glow: 'glow-cyan', title: 'Lightning Fast', desc: 'Optimized local C++ Whisper wrapper processes files instantly in less than 500ms after speaking.' },
            { icon: Globe, glow: 'glow-purple', title: 'Open Source', desc: 'Fully auditable codebase. Licensed open-source code ensures transparency and safety.' }
          ].map((card, idx) => (
            <div key={idx} className={`p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] text-left relative group transition-all duration-300 hover:-translate-y-1.5 ${card.glow}`}>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform duration-200">
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 INTERACTIVE DEMO */}
      <section id="interactive-demo" className="max-w-7xl w-full mx-auto px-6 py-16 md:py-24 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            See VoiceFloo in Action
          </h2>
          <p className="text-sm text-slate-400">
            Hold your hotkey, dictate, and release. Watch speech convert to text natively at your active cursor.
          </p>
        </div>
        <InteractiveDemo />
      </section>

      {/* 5 HOW IT WORKS (Timeline) */}
      <section className="max-w-7xl w-full mx-auto px-6 py-20 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">How It Works</h2>
          <p className="text-sm text-slate-400">Simple local integration gets you typing in less than two minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 text-left">
          {[
            { step: '01', title: 'Download', desc: 'Fetch the Windows installer setup file.' },
            { step: '02', title: 'Install', desc: 'Run the setup installer with a double click.' },
            { step: '03', title: 'Press Hotkey', desc: 'Press Alt + Space inside your editor.' },
            { step: '04', title: 'Speak', desc: 'Speak naturally to record your transcript.' },
            { step: '05', title: 'AI Transcribes', desc: 'Whisper translates the voice bytes.' },
            { step: '06', title: 'Text Appears', desc: 'Text injects directly at the cursor.' }
          ].map((timeline, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative group">
              <span className="text-2xl font-black text-blue-500/20 group-hover:text-blue-500/40 transition-colors font-mono block mb-4">{timeline.step}</span>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">{timeline.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{timeline.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 WORKS EVERYWHERE */}
      <section className="max-w-7xl w-full mx-auto px-6 py-24 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Integrates With Every App</h2>
          <p className="text-sm text-slate-400">Types into any software on your computer. If you can type in it, VoiceFloo works in it.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 select-none">
          {[
            { name: 'VS Code', icon: Terminal, color: 'text-blue-400' },
            { name: 'Google Docs', icon: FileText, color: 'text-cyan-400' },
            { name: 'Chrome', icon: Globe, color: 'text-emerald-400' },
            { name: 'ChatGPT', icon: MessageSquare, color: 'text-purple-400' },
            { name: 'Notepad', icon: Keyboard, color: 'text-indigo-400' },
            { name: 'Microsoft Word', icon: FileText, color: 'text-blue-500' },
            { name: 'Discord', icon: MessageSquare, color: 'text-indigo-500' },
            { name: 'Slack', icon: MessageSquare, color: 'text-emerald-500' },
            { name: 'Cursor IDE', icon: Terminal, color: 'text-cyan-500' },
            { name: 'JetBrains', icon: Terminal, color: 'text-red-500' }
          ].map((app, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] group cursor-pointer hover:border-white/15">
              <app.icon className={`w-8 h-8 ${app.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-bold text-white/80">{app.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7 PERFORMANCE METRICS */}
      <section className="max-w-6xl w-full mx-auto px-6 py-20 relative z-10 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Performance Benchmarks</h2>
          <p className="text-sm text-slate-400 font-medium">Engineered for instantaneous native response times.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCounter value="600" label="Typing Latency" prefix="<" suffix="ms" />
          <StatCounter value="100" label="Offline Execution" suffix="%" />
          <StatCounter value="100" label="Unlimited Dictation" suffix="%" />
          <StatCounter value="0" label="Cloud Uploads" suffix="%" />
        </div>
      </section>

      {/* 8 WHY VOICEFLOO (Comparison Card Grid) */}
      <section className="max-w-7xl w-full mx-auto px-6 py-24 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">VoiceFloo vs Cloud Solutions</h2>
          <p className="text-sm text-slate-400">See how local AI processing compares to standard internet alternatives.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
          {/* VoiceFloo Card */}
          <div className="p-8 rounded-3xl border border-blue-500/20 bg-blue-950/5 hover:border-blue-500/30 transition-all relative overflow-hidden group shadow-[0_8px_32px_rgba(59,130,246,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/5 opacity-100" />
            <h3 className="text-2xl font-black text-white mb-6 relative flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> VoiceFloo
            </h3>
            <ul className="space-y-4 relative text-sm select-text">
              {[
                { label: 'Runs 100% Offline', val: 'Yes — completely private' },
                { label: 'Voice Data Upload', val: 'Never — processed locally' },
                { label: 'Subscription Fees', val: 'None — free forever' },
                { label: 'Internet Needed', val: 'No — works on plane / train' },
                { label: 'Inference Latency', val: 'Instant (<500ms Whisper run)' }
              ].map((item, idx) => (
                <li key={idx} className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-bold text-cyan-400">{item.val}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cloud Dictation Card */}
          <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all relative overflow-hidden group">
            <h3 className="text-2xl font-black text-white/50 mb-6 relative flex items-center gap-2">
              <Globe className="w-5 h-5 text-white/40" /> Cloud Dictation
            </h3>
            <ul className="space-y-4 relative text-sm select-text">
              {[
                { label: 'Runs 100% Offline', val: 'No — fails without signal' },
                { label: 'Voice Data Upload', val: 'Yes — sent to cloud servers' },
                { label: 'Subscription Fees', val: 'Yes — typical monthly rates' },
                { label: 'Internet Needed', val: 'Yes — continuous connectivity' },
                { label: 'Inference Latency', val: 'Variable (network dependent)' }
              ].map((item, idx) => (
                <li key={idx} className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-bold text-slate-400">{item.val}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 9 SCREENSHOTS CAROUSEL */}
      <section className="max-w-7xl w-full mx-auto px-6 py-20 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Designed for Modern Desktops</h2>
          <p className="text-sm text-slate-400">Minimal user interfaces that stay out of your focus loop.</p>
        </div>

        {/* Carousel panels representation */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
          {/* Main Overlay panel screenshot mockup */}
          <div className="flex-1 p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:scale-[1.02] transition-transform shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-purple-600/5" />
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest text-left mb-4">Floating Dictation overlay</h4>
            <DesktopMockup />
          </div>

          {/* Settings panel screenshot mockup */}
          <div className="flex-1 p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:scale-[1.02] transition-transform shadow-2xl relative overflow-hidden group text-left">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/5 to-blue-600/5" />
            <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-4">Control Settings</h4>
            
            <div className="premium-glass border border-white/10 rounded-xl p-4 space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-bold text-white/80">Global Shortcut</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-cyan-300 font-mono">Alt + Space</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-bold text-white/80">Inference Threads</span>
                <span className="text-[10px] font-bold text-white/50">4 CPU Threads</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-bold text-white/80">Model Size</span>
                <span className="text-[10px] font-bold text-white/50">ggml-base.bin (140MB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/80">Language Auto-Detect</span>
                <span className="text-[10px] font-semibold text-emerald-400">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 TESTIMONIALS */}
      <section className="max-w-7xl w-full mx-auto px-6 py-24 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Loved by Professionals</h2>
          <p className="text-sm text-slate-400">Trusted by developers, authors, and power users who dictate at speed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left select-text">
          {[
            { name: 'Sarah Jenkins', role: 'Technical Author', text: '“VoiceFloo is exactly what I was searching for. I write technical guides completely offline while traveling, and it never drops a word.”' },
            { name: 'David Chen', role: 'Senior Developer', text: '“The SendInput keyboard injection is extremely robust. It prints code directly inside VS Code and terminal windows instantly.”' },
            { name: 'Amanda Rossi', role: 'Accessibility Lead', text: '“Privacy-first AI dictation is a game-changer. My dictation is processed entirely local, making it compliant with corporate security rules.”' }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors relative flex flex-col justify-between">
              <p className="text-xs text-slate-300 leading-relaxed mb-6 italic">{item.text}</p>
              <div>
                <h5 className="text-xs font-extrabold text-white">{item.name}</h5>
                <span className="text-[10px] text-slate-500 font-medium">{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11 FAQ SECTION */}
      <section className="max-w-4xl w-full mx-auto px-6 py-20 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">Everything you need to know about VoiceFloo dictation.</p>
        </div>

        <div className="space-y-3">
          <FaqItem
            question="Is VoiceFloo really free?"
            answer="Yes! VoiceFloo is completely free, open-source, and does not lock any features behind subscriptions, licenses, or advertising layers."
          />
          <FaqItem
            question="Does VoiceFloo run offline?"
            answer="Yes, completely offline. The transcription models (based on whisper.cpp) compile and run entirely on your local CPU threads. No internet is required once setup is completed."
          />
          <FaqItem
            question="Where is my audio data processed?"
            answer="Audio frames are captured from your hardware microphone line and processed inside memory. It never gets stored on cloud servers or shared with any third party."
          />
          <FaqItem
            question="Which applications are supported?"
            answer="VoiceFloo uses low-level native keyboard emulation to type text, ensuring full compatibility with Notepad, Chrome, VS Code, Slack, Discord, Microsoft Word, and terminal tools."
          />
          <FaqItem
            question="Which languages are supported?"
            answer="We support English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Hindi, Kannada, and automatic language detection."
          />
        </div>
      </section>

      {/* 12 FINAL CTA */}
      <section className="max-w-6xl w-full mx-auto px-6 py-24 text-center relative z-10 border-t border-white/5">
        <div className="p-12 md:p-16 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/10 via-cyan-950/5 to-slate-900/25 backdrop-blur-3xl text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none z-0" />
          
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight relative z-10">Ready to Flow?</h2>
          <p className="text-md text-slate-400 max-w-[500px] mx-auto leading-relaxed relative z-10">
            Join developers, designers, and writers who speech-type completely offline. Get VoiceFloo today.
          </p>
          
          <div className="pt-4 relative z-10">
            <Link
              href="https://github.com/realabrar1/VoiceFloo/releases/download/v1.0.0/voicefloo-1.0.0-setup.exe"
              className="bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold px-8 py-4 rounded-xl transition-all shadow-md hover:scale-[1.02] inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <Download className="w-5 h-5" />
              <span>Download VoiceFloo Free</span>
            </Link>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 relative z-10">Free Forever • 100% Offline • Windows Native</p>
        </div>
      </section>

    </div>
  )
}

