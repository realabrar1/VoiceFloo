'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Sparkles, Download, Shield, Zap, Keyboard, HelpCircle,
  ArrowRight, CheckCircle2, Command,
  Terminal, FileText, Check, Play, Pause, Trash2,
  Globe, Cpu, Loader2, Laptop, Rocket, Brain, Mic
} from 'lucide-react'
import Lenis from 'lenis'
import { VscVscode, VscTerminal } from 'react-icons/vsc'
import { SiGoogledocs, SiGooglechrome, SiNotepadplusplus, SiDiscord, SiWarp } from 'react-icons/si'
import { FaSlack } from 'react-icons/fa'
import { BsMicrosoftTeams } from 'react-icons/bs'

// Minimalist 3D Rotating Cube representation (Pure CSS 3D, matches the Resend logo cube style)
const HeroCube = () => {
  return (
    <div className="relative w-72 h-72 flex items-center justify-center select-none">
      <div className="absolute inset-0 bg-[#9281f7]/5 blur-3xl rounded-full" />
      <div className="w-48 h-48 [perspective:1000px]">
        <motion.div
          className="w-full h-full relative [transform-style:preserve-3d]"
          animate={{ rotateY: 360, rotateX: 180 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        >
          {/* 6 Cube Faces */}
          <div className="absolute inset-0 border border-[#292d30] bg-[#000000e6] [transform:translateZ(96px)] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#9281f7]" />
          </div>
          <div className="absolute inset-0 border border-[#292d30] bg-[#000000e6] [transform:rotateY(180deg)_translateZ(96px)]" />
          <div className="absolute inset-0 border border-[#292d30] bg-[#000000e6] [transform:rotateY(90deg)_translateZ(96px)]" />
          <div className="absolute inset-0 border border-[#292d30] bg-[#000000e6] [transform:rotateY(-90deg)_translateZ(96px)]" />
          <div className="absolute inset-0 border border-[#292d30] bg-[#000000e6] [transform:rotateX(90deg)_translateZ(96px)]" />
          <div className="absolute inset-0 border border-[#292d30] bg-[#000000e6] [transform:rotateX(-90deg)_translateZ(96px)]" />
        </motion.div>
      </div>
    </div>
  )
}

// Resend-style Monospace Dictation Overlay Mockup (Commit Mono fonts, 1px graphite border, absolute dark black)
const DesktopMockup = () => {
  const [micState, setMicState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [displayText, setDisplayText] = useState('')
  const [duration, setDuration] = useState(0)

  const demoTranscript = 'Speak. Think. Flow. VoiceFloo types completely offline using local Whisper AI.'

  useEffect(() => {
    let timer: NodeJS.Timeout
    let active = true

    const runDemo = async () => {
      while (active) {
        setMicState('idle')
        setDisplayText('')
        setDuration(0)
        await new Promise(r => setTimeout(r, 2000))
        if (!active) break

        setMicState('recording')
        let secs = 0
        timer = setInterval(() => {
          secs++
          setDuration(secs)
        }, 1000)

        // Type out text
        const words = demoTranscript.split(' ')
        let current = ''
        for (let i = 0; i < words.length; i++) {
          current += (i === 0 ? '' : ' ') + words[i]
          setDisplayText(current)
          await new Promise(r => setTimeout(r, 280 + Math.random() * 150))
          if (!active) break
        }

        clearInterval(timer)
        if (!active) break

        setMicState('processing')
        await new Promise(r => setTimeout(r, 1200))
        if (!active) break

        setMicState('idle')
        await new Promise(r => setTimeout(r, 3000))
      }
    }

    runDemo()

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="w-full max-w-[360px] bg-[#000000] border border-[#292d30] rounded-xl p-5 select-none font-commit shadow-lg text-[13px]">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className={`status-dot ${micState === 'recording' ? 'status-dot-bounced animate-pulse' : micState === 'processing' ? 'status-dot-opened animate-pulse' : 'status-dot-delivered'}`} />
          <span className="text-[#a1a4a5] font-mono">
            {formatTimer(duration)}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-3 h-8">
          {micState === 'processing' ? (
            <span className="text-[11px] font-medium text-[#9281f7] tracking-wider uppercase animate-pulse flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
            </span>
          ) : micState === 'recording' ? (
            <span className="text-[11px] font-medium text-[#3ad389] tracking-wider uppercase animate-pulse">
              Recording
            </span>
          ) : (
            <span className="text-[11px] font-medium text-[#6e727a] uppercase tracking-widest">System Ready</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#000000] flex items-center justify-center text-[#6e727a] border border-[#292d30]">
            <Trash2 className="w-3.5 h-3.5" />
          </div>
          <div className="w-6 h-6 rounded bg-[#000000] flex items-center justify-center text-[#6e727a] border border-[#292d30]">
            {micState === 'recording' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </div>
          <div className="w-6 h-6 rounded bg-[#000000] flex items-center justify-center text-[#9281f7] border border-[#292d30]">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="mt-3.5 min-h-[60px] p-3 rounded border border-[#292d30] bg-[#000000] text-left select-text relative">
        {displayText ? (
          <p className="text-[#f0f0f0] leading-relaxed">
            {displayText}
            <span className="w-1.5 h-3.5 bg-[#9281f7] inline-block animate-pulse ml-0.5 align-middle" />
          </p>
        ) : (
          <p className="text-[#6e727a] font-mono text-center pt-2">
            Ready to dictate...
          </p>
        )}
      </div>
    </div>
  )
}

// Stats badges displaying benchmark latency metrics
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
    <div ref={ref} className="p-8 rounded-xl border border-[#292d30] bg-[#000000] flex flex-col justify-between min-h-[160px] h-full transition-colors hover:border-[#a1a4a5]">
      <div className="text-5xl font-normal text-white font-commit tracking-tight text-glow select-text mb-4">
        {value.includes('<') && count === 0 ? value : `${prefix}${count}${suffix}`}
      </div>
      <p className="text-[12px] font-mono uppercase tracking-widest text-[#a1a4a5]">{label}</p>
    </div>
  )
}

// Developer-focused interactive editor workflow simulator
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
          await new Promise(r => setTimeout(r, 55 + Math.random() * 25))
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
    <div className="w-full max-w-4xl mx-auto rounded-xl border border-[#292d30] bg-[#000000] shadow-2xl relative overflow-hidden text-left font-commit">
      {/* Editor Titlebar with Traffic Light Dots */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#000000] border-b border-[#292d30] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff9592]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffca16]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#3ad389]" />
        </div>
        <div className="text-[12px] text-[#a1a4a5] flex items-center gap-2 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-[#a1a4a5]" />
          <span>src/dictation.ts</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Code Area */}
      <div className="p-8 min-h-[220px] text-[13px] relative select-text leading-relaxed">
        <div className="text-[#464a4d] select-none space-y-1">
          <p>1 <span className="text-[#a1a4a5]">import</span> &#123; dictate &#125; <span className="text-[#a1a4a5]">from</span> <span className="text-[#9281f7]">&quot;voicefloo-dictate&quot;</span></p>
          <p>2 </p>
          <p>3 <span className="text-[#464a4d]">// Press Alt + Space to start dictating instantly</span></p>
        </div>

        <div className="flex items-center mt-1">
          <span className="text-[#464a4d] mr-4 select-none">4</span>
          <span className="text-[#f0f0f0]">
            {text}
            <span className="w-1.5 h-4 bg-[#9281f7] inline-block animate-pulse ml-0.5" />
          </span>
        </div>

        <AnimatePresence>
          {(step === 'shortcut' || step === 'listening') && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute bottom-6 right-6 z-20 flex items-center gap-3.5 p-4 rounded bg-[#000000] border border-[#292d30] select-none"
            >
              {step === 'shortcut' ? (
                <div className="flex items-center gap-2 text-[12px] font-mono text-[#f0f0f0]">
                  <Command className="w-4 h-4 text-[#9281f7]" />
                  <span>Shortcut Triggered</span>
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  <span className="status-dot status-dot-bounced animate-pulse" />
                  <span className="text-[12px] font-mono text-[#f0f0f0] uppercase tracking-wider">Listening...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Accordion FAQ Element
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#292d30] py-6 text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-[18px] font-medium text-white hover:text-[#9281f7] transition-colors cursor-pointer"
      >
        <span>{question}</span>
        <HelpCircle className={`w-5 h-5 text-[#6e727a] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#9281f7]' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="text-[15px] text-[#a1a4a5] leading-relaxed pt-3 pb-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HomePage() {
  useEffect(() => {
    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <div className="w-full flex flex-col items-center bg-[#000000]">

      {/* 1 HERO SECTION */}
      <section className="min-h-[90vh] w-full flex items-center justify-center pt-24 pb-16 relative z-10 border-b border-[#292d30]">
        <div className="site-container flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Text */}
          <div className="flex-1 text-left space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#292d30] text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider select-none">
              <span>Announcing VoiceFloo v1.0.0 &gt;</span>
            </div>

            <h1 className="text-[44px] sm:text-[77px] lg:text-[96px] leading-[1.1] sm:leading-[1.0] font-domaine font-normal text-white select-text">
              Speak. Think. Flow.
            </h1>

            <p className="text-[15px] sm:text-[18px] text-[#f0f0f0] font-normal leading-relaxed max-w-[500px]">
              The fastest offline AI dictation assistant. VoiceFloo types natively wherever your cursor is. No cloud. No subscription.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/download"
                className="btn-primary w-full sm:w-auto"
                style={{ backgroundColor: '#3b9eff' }}
              >
                <Download className="w-4 h-4" />
                <span>Get Started Free</span>
              </Link>
              <a
                href="#demo"
                className="btn-ghost w-full sm:w-auto"
              >
                <span>Documentation</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Cube Visual */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <HeroCube />
          </div>
        </div>
      </section>

      {/* 2 TRUST LOGOS (Social Proof Marquee) */}
      <section className="w-full py-8 border-b border-[#292d30] bg-[#000000] overflow-hidden select-none">
        <div className="animate-marquee gap-16 flex">
          {[
            '100% Offline AI', 'Zero Telemetry', 'Domaine Style', 'Commit Mono Syntax',
            'Windows Native', 'Accessibility Focus', 'Open Source Client', 'Iris Violet Highlights'
          ].map((tag, idx) => (
            <div key={idx} className="flex items-center gap-2.5 px-6">
              <span className="status-dot status-dot-delivered" />
              <span className="text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider">{tag}</span>
            </div>
          ))}
          {/* Repeat list */}
          {[
            '100% Offline AI', 'Zero Telemetry', 'Domaine Style', 'Commit Mono Syntax',
            'Windows Native', 'Accessibility Focus', 'Open Source Client', 'Iris Violet Highlights'
          ].map((tag, idx) => (
            <div key={idx + 10} className="flex items-center gap-2.5 px-6">
              <span className="status-dot status-dot-delivered" />
              <span className="text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider">{tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 PROBLEM SECTION */}
      <section className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container max-w-4xl text-center space-y-6">
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white mb-12">
            Beyond the Cloud
          </h2>
          <p className="text-[18px] text-[#a1a4a5] leading-relaxed max-w-2xl mx-auto">
            Your voice represents personal identity. Standard dictation wrappers stream your sound files to third-party endpoints. VoiceFloo executes locally on your CPU cores — zero servers, zero telemetry.
          </p>
        </div>
      </section>

      {/* 4 INTERACTIVE DEMO */}
      <section id="demo" className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container space-y-16 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white mb-12">
              Type Natively
            </h2>
            <p className="text-[18px] text-[#a1a4a5]">
              Press Alt + Space inside your editor, dictate speech, and release. The text types directly into the cursor focus window.
            </p>
          </div>
          <InteractiveDemo />
        </div>
      </section>

      {/* 5 FEATURES GRID */}
      <section className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container space-y-16">
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white text-center mb-12">
            Designed for Developers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Offline AI Compute', desc: 'No transcripts are saved. Voice data translates internally on local memory threads.', detail: 'whisper.cpp core' },
              { title: 'Privacy Guarantee', desc: 'Your audio logs and transcripts never touch any telemetry servers or cloud endpoints.', detail: 'Zero uploads' },
              { title: 'Low-Level Inject', desc: 'Simulates keystroke actions to print output inside VS Code, Word, and terminals.', detail: 'SendInput API' },
              { title: 'Global Shortcuts', desc: 'Control speech toggles or trigger models with minimal latency overrides.', detail: 'Alt + Space' },
              { title: 'Optimized Latency', desc: 'Processes dictation logs in under 500ms after you finish speaking.', detail: 'CPU multithreading' },
              { title: 'Auditable Client', desc: 'Licensed open-source repository. Read the source code on our GitHub repo.', detail: 'MIT License' }
            ].map((card, idx) => (
              <div key={idx} className="resend-card flex flex-col justify-between min-h-[220px]">
                <div className="space-y-4">
                  <span className="font-commit text-[13px] text-[#9281f7]">{card.detail}</span>
                  <h3 className="text-[20px] font-medium text-white tracking-tight">{card.title}</h3>
                  <p className="text-[14px] text-[#a1a4a5] leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <br />
      {/* 6 WORKFLOW TIMELINE */}
      <section className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container space-y-16">
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white text-center mb-12">
            Getting Started
          </h2>
          <br />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 text-left">
            {[
              {
                step: '01',
                title: 'Download',
                desc: 'Setup EXE binary file.',
                icon: <Download className="w-9 h-9 text-[#9281f7] transition-transform duration-300 group-hover:scale-110" />
              },
              {
                step: '02',
                title: 'Run Setup',
                desc: 'Installs inside standard program folders.',
                icon: <Laptop className="w-9 h-9 text-[#9281f7] transition-transform duration-300 group-hover:scale-110" />
              },
              {
                step: '03',
                title: 'Start Application',
                desc: 'Launches local system tray icon.',
                icon: <Rocket className="w-9 h-9 text-[#9281f7] transition-transform duration-300 group-hover:scale-110" />
              },
              {
                step: '04',
                title: 'Model Check',
                desc: 'Downloads default speech model.',
                icon: <Brain className="w-9 h-9 text-[#9281f7] transition-transform duration-300 group-hover:scale-110" />
              },
              {
                step: '05',
                title: 'Configure Keys',
                desc: 'Override default shortcut commands.',
                icon: <Keyboard className="w-9 h-9 text-[#9281f7] transition-transform duration-300 group-hover:scale-110" />
              },
              {
                step: '06',
                title: 'Dictate Speech',
                desc: 'Type instantly in any background.',
                icon: <Mic className="w-9 h-9 text-[#9281f7] transition-transform duration-300 group-hover:scale-110" />
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{
                  y: -4,
                  borderColor: '#9281f7'
                }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl border border-[#292d30] bg-[#000000] min-h-[220px] flex flex-col items-center justify-center text-center select-none cursor-pointer group"
              >
                <div className="flex justify-center items-center mb-5 w-10 h-10">
                  {item.icon}
                </div>
                <span className="font-commit text-[13px] text-[#9281f7] block mb-2">{item.step}</span>
                <h4 className="text-[14px] font-medium text-white mb-2">{item.title}</h4>
                <p className="text-[12px] text-[#a1a4a5] leading-relaxed max-w-[150px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <br />

      {/* 7 INTEGRATIONS LOGOS */}
      <section className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container space-y-16 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white mb-12">
              Integrates Anywhere
            </h2>
            <p className="text-[18px] text-[#a1a4a5]">
              Types natively inside all productivity tools, editors, and windows.
            </p>
            <br />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'VS Code', Icon: VscVscode, color: '#007ACC' },
              { name: 'Google Docs', Icon: SiGoogledocs, color: '#4285F4' },
              { name: 'Chrome', Icon: SiGooglechrome, color: '#EA4335' },
              { name: 'Slack', Icon: FaSlack, color: '#36C5F0' },
              { name: 'Notepad++', Icon: SiNotepadplusplus, color: '#90E53D' },
              { name: 'Microsoft Teams', Icon: BsMicrosoftTeams, color: '#6264A7' },
              { name: 'Discord', Icon: SiDiscord, color: '#5865F2' },
              { name: 'Terminal', Icon: VscTerminal, color: '#f0f0f0' },
              { name: 'Warp', Icon: SiWarp, color: '#f0f0f0' },
              { name: 'Cursor', Icon: null, isSvg: true, path: '/logos/cursor.svg' }
            ].map((app, idx) => (
              <motion.div
                key={idx}
                whileHover={{
                  y: -4,
                  borderColor: '#4A9EFF',
                  backgroundColor: 'rgba(74, 158, 255, 0.03)'
                }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl border border-[#292d30] bg-[#000000] flex flex-col items-center justify-center gap-4 aspect-square w-full select-none cursor-pointer"
              >
                {app.isSvg ? (
                  <img
                    src={app.path}
                    className="w-8 h-8 object-contain"
                    alt={`${app.name} Logo`}
                  />
                ) : app.Icon ? (
                  <app.Icon
                    className="w-8 h-8 object-contain"
                    style={{ color: app.color }}
                  />
                ) : null}
                <span className="font-commit text-[13px] text-[#f0f0f0]">{app.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 PERFORMANCE STATS */}
      <section className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container space-y-16">
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white text-center mb-12">
            Performance Benchmarks
          </h2>
          <br />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatCounter value="600" label="Typing Latency" prefix="<" suffix="ms" />
            <StatCounter value="100" label="Offline Run" suffix="%" />
            <StatCounter value="100" label="Privacy Level" suffix="%" />
            <StatCounter value="0" label="Cloud Traffic" suffix="%" />
          </div>
        </div>
      </section>

      <br />

      {/* 10 TESTIMONIALS */}
      <section className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container space-y-16">
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white text-center mb-12">
            Beyond Expectations
          </h2>
          <br />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Jenkins', role: 'Technical Author', quote: 'VoiceFloo changed my workflow completely. I write technical logs offline while traveling, and it never drops a word.' },
              { name: 'David Chen', role: 'Developer', quote: 'The keyboard inject engine is extremely robust. It prints code directly inside VS Code and terminals instantly.' },
              { name: 'Amanda Rossi', role: 'Security Architect', quote: 'Privacy-first dictation is a game changer. The audio frame processing runs entirely inside memory.' }
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-xl border border-[#292d30] bg-[#000000] flex flex-col items-center justify-center text-center min-h-[240px] hover:border-[#9281f7] transition-colors select-none">
                <p className="text-[15px] text-[#f0f0f0] italic leading-relaxed mb-6">“{item.quote}”</p>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#292d30] flex items-center justify-center text-white text-[12px] font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <h5 className="text-[14px] font-medium text-[#f0f0f0]">{item.name}</h5>
                    <span className="text-[12px] text-[#a1a4a5] font-mono block mt-0.5">{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <br />
      {/* 11 FAQ ACCORDION */}
      <section className="py-24 md:py-36 w-full relative z-10 border-b border-[#292d30]">
        <div className="site-container max-w-3xl space-y-16">
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white text-center mb-12">
            FAQ
          </h2>
          <br />
          <br />
          <div className="space-y-2">
            <FaqItem
              question="Does VoiceFloo stream audio data?"
              answer="No. Audio inputs are converted inside local RAM blocks using compiled C++ Whisper libraries. No network connections are initiated during execution."
            />
            <FaqItem
              question="Is VoiceFloo free?"
              answer="Yes. VoiceFloo is fully open-source and free, distributed under the MIT license without any subscription restrictions."
            />
          </div>
        </div>
      </section>

      {/* 12 DOWNLOAD CTA */}
      <section className="py-24 md:py-36 w-full relative z-10">
        <div className="site-container max-w-3xl text-center space-y-8">
          <h2 className="text-[32px] sm:text-[44px] md:text-[56px] font-normal font-abc tracking-[-1.5px] sm:tracking-[-2.8px] leading-[1.2] text-white mb-12">
            Ready to Flow?
          </h2>
          <p className="text-[18px] text-[#a1a4a5] max-w-md mx-auto">
            Get offline voice dictation for Windows today. Free and open source.
          </p>
          <div className="pt-4">
            <Link
              href="https://github.com/realabrar1/VoiceFloo/releases/download/v1.0.0/voicefloo-1.0.0-setup.exe"
              className="btn-primary px-10 py-4"
              style={{ backgroundColor: '#3b9eff' }}
            >
              <Download className="w-5 h-5" />
              <span>Download VoiceFloo Setup.exe</span>
            </Link>
          </div>
          <p className="text-[12px] font-mono text-[#6e727a] uppercase tracking-widest pt-2">Windows 10 / 11 (64-bit)</p>
        </div>
      </section>

    </div>
  )
}
