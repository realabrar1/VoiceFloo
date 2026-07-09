'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Cpu, Shield, Zap, Keyboard, Command, Download, Terminal, Globe, ChevronRight } from 'lucide-react'

// Sub-feature illustration widgets
const WaveformWidget = () => {
  return (
    <div className="w-full max-w-[360px] p-6 rounded-xl border border-[#292d30] bg-[#000000] font-commit text-[13px] text-left relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#9281f7]/5 blur-2xl rounded-full" />
      <span className="text-[#9281f7] text-[11px] uppercase tracking-wider block mb-4">whisper.cpp engine</span>
      
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between border-b border-[#292d30] pb-2">
          <span className="text-[#a1a4a5]">CPU Threads</span>
          <span className="text-white font-medium">4 Core Multi-thread</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#292d30] pb-2">
          <span className="text-[#a1a4a5]">RAM Buffered</span>
          <span className="text-[#3ad389] font-medium">ggml-base.bin</span>
        </div>
        
        {/* Animated frequency bands */}
        <div className="h-12 flex items-end justify-center gap-1.5 pt-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-[#9281f7] rounded-full"
              animate={{ height: [6, 32 * Math.sin((i / 14) * Math.PI) * (0.4 + Math.random() * 0.6), 6] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.03 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const TypistWidget = () => {
  const [typed, setTyped] = useState('')
  const snippet = 'const flow = new DictationEngine();'

  useEffect(() => {
    let active = true
    const animate = async () => {
      while (active) {
        setTyped('')
        await new Promise(r => setTimeout(r, 1000))
        for (let i = 0; i <= snippet.length; i++) {
          if (!active) break
          setTyped(snippet.slice(0, i))
          await new Promise(r => setTimeout(r, 80))
        }
        await new Promise(r => setTimeout(r, 2000))
      }
    }
    animate()
    return () => { active = false }
  }, [])

  return (
    <div className="w-full max-w-[360px] p-6 rounded-xl border border-[#292d30] bg-[#000000] font-commit text-[13px] text-left relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#3b9eff]/5 blur-2xl rounded-full" />
      <span className="text-[#3b9eff] text-[11px] uppercase tracking-wider block mb-4">SendInput Injection</span>
      
      <div className="space-y-3 font-mono text-[12px] relative z-10">
        <p className="text-[#464a4d]">1 <span className="text-[#a1a4a5]">class</span> DictationEngine &#123;</p>
        <p className="text-[#464a4d]">2   <span className="text-[#a1a4a5]">constructor</span>() &#123;&#125;</p>
        <p className="text-[#464a4d]">3   <span className="text-[#a1a4a5]">inject</span>() &#123;</p>
        <div className="flex items-center text-[#f0f0f0]">
          <span className="text-[#464a4d] mr-2">4     </span>
          <span>
            {typed}
            <span className="w-1.5 h-3.5 bg-[#9281f7] inline-block animate-pulse ml-0.5" />
          </span>
        </div>
        <p className="text-[#464a4d]">5   &#125;</p>
        <p className="text-[#464a4d]">6 &#125;</p>
      </div>
    </div>
  )
}

const HotkeyWidget = () => {
  return (
    <div className="w-full max-w-[360px] p-6 rounded-xl border border-[#292d30] bg-[#000000] font-commit text-[13px] text-left relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#3ad389]/5 blur-2xl rounded-full" />
      <span className="text-[#3ad389] text-[11px] uppercase tracking-wider block mb-4">Global Hook Bindings</span>
      
      <div className="flex flex-col gap-3 relative z-10 pt-2">
        <div className="flex items-center gap-3">
          <kbd className="px-3 py-1.5 rounded bg-[#000000] border border-[#292d30] font-mono text-white text-[12px] shadow-sm">Alt</kbd>
          <span className="text-[#a1a4a5] text-[12px]">+</span>
          <kbd className="px-3 py-1.5 rounded bg-[#000000] border border-[#292d30] font-mono text-white text-[12px] shadow-sm">Space</kbd>
        </div>
        <p className="text-[12px] text-[#a1a4a5] leading-relaxed pt-2 border-t border-[#292d30]">
          Overrides standard background tasks without modifying Windows default clipboard arrays.
        </p>
      </div>
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <div className="w-full bg-[#000000] text-[#f0f0f0] min-h-screen">
      
      {/* Header Headline */}
      <section className="py-24 border-b border-[#292d30]">
        <div className="site-container text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#292d30] text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider select-none">
            <Sparkles className="w-4 h-4 text-[#9281f7]" />
            <span>Product Mechanics</span>
          </div>
          <h1 className="text-[56px] md:text-[77px] leading-[1.1] font-domaine text-white tracking-tight">
            Natively Integrated
          </h1>
          <p className="text-[18px] text-[#a1a4a5] leading-relaxed max-w-xl mx-auto">
            Explore the developer tools, audio engines, and layout features powering VoiceFloo local dictation.
          </p>
        </div>
      </section>

      {/* Feature Section 1: Offline AI */}
      <section className="py-24 border-b border-[#292d30]">
        <div className="site-container flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-6 text-left max-w-xl">
            <span className="font-commit text-[13px] text-[#9281f7] uppercase tracking-widest block">Core Engine</span>
            <h2 className="text-[36px] md:text-[56px] font-normal font-abc tracking-[-2.8px] leading-[1.2] text-white">
              100% Offline AI
            </h2>
            <p className="text-[16px] text-[#a1a4a5] leading-relaxed">
              No subscription limits. VoiceFloo executes transcription calculations directly inside your local computer threads using whisper.cpp cores. Once setup unzips model binaries, no internet connections are ever opened.
            </p>
            <ul className="space-y-3 font-commit text-[13px] text-[#f0f0f0]">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#9281f7]" />
                <span>Zero telemetry audio streaming</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#9281f7]" />
                <span>Multi-threaded local CPU parsing</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center md:justify-end w-full">
            <WaveformWidget />
          </div>
        </div>
      </section>

      {/* Feature Section 2: Type Anywhere */}
      <section className="py-24 border-b border-[#292d30]">
        <div className="site-container flex flex-col md:flex-row-reverse items-center justify-between gap-16">
          <div className="flex-1 space-y-6 text-left max-w-xl">
            <span className="font-commit text-[13px] text-[#3b9eff] uppercase tracking-widest block">System Injection</span>
            <h2 className="text-[36px] md:text-[56px] font-normal font-abc tracking-[-2.8px] leading-[1.2] text-white">
              Type Anywhere
            </h2>
            <p className="text-[16px] text-[#a1a4a5] leading-relaxed">
              Print output natively wherever your active text cursor is placed. Our local handler utilizes native Windows SendInput API keys to write symbols directly, supporting Chrome, Word, VS Code, and standard terminal setups.
            </p>
            <ul className="space-y-3 font-commit text-[13px] text-[#f0f0f0]">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#3b9eff]" />
                <span>Automatic focus window restore</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#3b9eff]" />
                <span>Standard clipboard restoration fallback</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center md:justify-start w-full">
            <TypistWidget />
          </div>
        </div>
      </section>

      {/* Feature Section 3: Global Hotkeys */}
      <section className="py-24 border-b border-[#292d30]">
        <div className="site-container flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-6 text-left max-w-xl">
            <span className="font-commit text-[13px] text-[#3ad389] uppercase tracking-widest block">Keyboard Bindings</span>
            <h2 className="text-[36px] md:text-[56px] font-normal font-abc tracking-[-2.8px] leading-[1.2] text-white">
              Global Shortcuts
            </h2>
            <p className="text-[16px] text-[#a1a4a5] leading-relaxed">
              Initiate and commit dictations without looking at application windows. Control speech toggles globally inside any editor or software client using simple hotkey maps.
            </p>
            <ul className="space-y-3 font-commit text-[13px] text-[#f0f0f0]">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#3ad389]" />
                <span>Configure custom shortcuts inside settings</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#3ad389]" />
                <span>System tray background startup listener</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center md:justify-end w-full">
            <HotkeyWidget />
          </div>
        </div>
      </section>

      {/* Download CTA Banner */}
      <section className="py-24">
        <div className="site-container max-w-3xl text-center space-y-8">
          <h2 className="text-[56px] font-normal font-abc tracking-[-2.8px] leading-[1.2] text-white">
            Get VoiceFloo Free
          </h2>
          <p className="text-[18px] text-[#a1a4a5] max-w-md mx-auto">
            Speech-type completely offline on Windows. Zero cloud logging.
          </p>
          <div>
            <Link
              href="https://github.com/realabrar1/VoiceFloo/releases/download/v1.0.0/voicefloo-1.0.0-setup.exe"
              className="btn-primary px-10 py-4"
              style={{ backgroundColor: '#3b9eff' }}
            >
              <Download className="w-5 h-5" />
              <span>Download Setup Binary</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
