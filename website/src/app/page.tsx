'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mic, Download, Shield, Zap, Keyboard, HelpCircle, ArrowRight, CheckCircle2, Languages, Clipboard, Command } from 'lucide-react'

// Animated Desktop Window Mockup
const DesktopMockup = () => {
  const [micState, setMicState] = useState<'idle' | 'recording'>('idle')
  const [displayText, setDisplayText] = useState('')
  const demoTranscript = 'Dear Hiring Manager, I hope you are doing well. I am excited to apply for the software engineer position at your company...'

  useEffect(() => {
    // Loop the typing dictation mockup animation
    const runDemo = async () => {
      // 1. Idle phase
      setMicState('idle')
      setDisplayText('')
      await new Promise(r => setTimeout(r, 2000))

      // 2. Start recording
      setMicState('recording')
      await new Promise(r => setTimeout(r, 1000))

      // 3. Type words out sequentially
      const words = demoTranscript.split(' ')
      let current = ''
      for (let i = 0; i < words.length; i++) {
        current += (i === 0 ? '' : ' ') + words[i]
        setDisplayText(current)
        await new Promise(r => setTimeout(r, 150 + Math.random() * 150))
      }

      await new Promise(r => setTimeout(r, 3000))
      runDemo()
    }

    runDemo()
  }, [])

  return (
    <div className="w-full max-w-[500px] mx-auto p-4 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
      
      {/* Title bar Mockup */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/5 text-[10px] font-bold text-white/30 tracking-wider uppercase select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span>VoiceFloo Engine</span>
        <div className="w-8" />
      </div>

      {/* Visualizer Waveform mockup */}
      <div className="h-28 flex flex-col items-center justify-center py-4">
        {micState === 'recording' ? (
          <div className="flex items-end gap-1.5 h-16">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-blue-400"
                animate={{ height: [8, 48 * Math.sin((i / 14) * Math.PI) * (0.4 + Math.random() * 0.6), 8] }}
                transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-md">
            <Mic className="w-7 h-7" />
          </div>
        )}
      </div>

      {/* Transcript Textbox */}
      <div className="h-24 p-3.5 border border-white/5 bg-white/[0.01] rounded-2xl text-left overflow-y-auto mb-3 select-none">
        {displayText ? (
          <p className="text-xs text-white/95 leading-relaxed font-medium">
            {displayText}
            <span className="w-1.5 h-3.5 bg-blue-500 inline-block animate-pulse ml-0.5" />
          </p>
        ) : (
          <p className="text-xs text-white/20 font-medium text-center pt-5">
            Press global shortcut to start dictating...
          </p>
        )}
      </div>

      {/* Footer details mockup */}
      <div className="flex items-center justify-between text-[8px] font-bold text-white/30 uppercase tracking-widest px-1.5 select-none">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500/70" /> Private Offline mode</span>
        <span>v1.0.0</span>
      </div>
    </div>
  )
}

// FAQ Accordion Card
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/5 pb-4 text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-xs font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
      >
        <span>{question}</span>
        <HelpCircle className={`w-4 h-4 text-white/35 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
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
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5 pb-2.5">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="w-full relative flex flex-col items-center">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="max-w-6xl w-full mx-auto px-4 pt-16 md:pt-24 pb-16 text-center relative z-10">
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/15 bg-blue-900/10 text-[10px] font-bold tracking-widest text-cyan-400 uppercase tracking-widest select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Offline AI Dictation</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Speak. Think. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Flow.</span>
          </h1>

          <p className="text-sm md:text-md text-slate-400 max-w-[500px] mx-auto leading-relaxed">
            Dictate text seamlessly into any desktop application. No audio ever leaves your computer. Powered by fast local whisper.cpp models.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/download"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows</span>
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Documentation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Hero mockup window */}
        <div className="mt-16 md:mt-20">
          <DesktopMockup />
        </div>
      </section>

      {/* CORE STATS BADGES */}
      <section className="border-t border-b border-white/5 bg-[#050710]/40 w-full py-8 relative z-10 select-none">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mb-2">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Privacy First</h4>
            <p className="text-[10px] text-slate-500">Zero cloud connections</p>
          </div>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Lightning Fast</h4>
            <p className="text-[10px] text-slate-500">Under 50ms latencies</p>
          </div>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 mb-2">
              <Keyboard className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Type Anywhere</h4>
            <p className="text-[10px] text-slate-500">Universal inputs</p>
          </div>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400 mb-2">
              <Command className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Voice Shortcuts</h4>
            <p className="text-[10px] text-slate-500">Vocal cursor commands</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section className="max-w-4xl w-full mx-auto px-4 py-20 text-center relative z-10">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">Simple 4-Step Setup</h2>
        <p className="text-xs text-slate-500 max-w-[400px] mx-auto mb-12">Get started with native dictation on Windows in under two minutes.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {[
            { step: '1', title: 'Download', desc: 'Fetch the Windows setup installer directly from GitHub releases.' },
            { step: '2', title: 'Install', desc: 'Run the setup installer. Launches in a single click.' },
            { step: '3', title: 'Hotkey', desc: 'Hold Ctrl + Shift + Space inside any active text application.' },
            { step: '4', title: 'Flow', desc: 'Speak naturally. Text prints instantly at your cursor location.' }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative">
              <div className="absolute top-4 right-4 text-3xl font-black text-white/5 font-mono">{item.step}</div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-3xl w-full mx-auto px-4 py-16 text-center relative z-10 border-t border-white/5">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">Frequently Asked Questions</h2>
        <p className="text-xs text-slate-500 max-w-[400px] mx-auto mb-10">Everything you need to know about VoiceFloo offline AI dictation.</p>

        <div className="space-y-3">
          <FaqItem
            question="Is VoiceFloo free?"
            answer="Yes! VoiceFloo is completely free, open-source, and contains no advertisements, paid subscriptions, or premium locks."
          />
          <FaqItem
            question="Does VoiceFloo work offline?"
            answer="Absolutely. The core speech model compiles and runs natively on your CPU threads. No internet is required once download packages are completed."
          />
          <FaqItem
            question="Is my voice uploaded to third parties?"
            answer="No. Your speech remains private. Audio frames are captured directly from your hardware mic line and fed to the local speech engine."
          />
          <FaqItem
            question="Which applications are supported?"
            answer="VoiceFloo simulates standard Windows keypress codes, meaning it integrates flawlessly with Notepad, Word, VS Code, Google Chrome, Discord, Slack, and terminal shells."
          />
          <FaqItem
            question="Which languages are supported?"
            answer="We support English, Spanish, French, German, Japanese, Chinese, Hindi, Kannada, Urdu, and automatic language detection."
          />
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl w-full mx-auto px-4 py-20 text-center relative z-10 border-t border-white/5">
        <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/10 via-cyan-950/5 to-slate-900/20 backdrop-blur-3xl text-center space-y-6">
          <h2 className="text-3xl font-black text-white">Experience Premium Dictation</h2>
          <p className="text-xs text-slate-400 max-w-[400px] mx-auto leading-relaxed">
            Join developers, writers, and professionals who turn speech into text instantly. Download the setup binary now.
          </p>
          <div className="pt-2">
            <Link
              href="/download"
              className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-white/5 inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <Download className="w-4 h-4" />
              <span>Get VoiceFloo Free</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
