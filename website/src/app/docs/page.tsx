import React from 'react'
import { Sparkles, Command, Shield, Mic, CheckCircle } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-16 md:py-24 text-left relative z-10 space-y-12">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/10 bg-blue-900/5 text-[9px] font-bold tracking-widest text-cyan-400 uppercase select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Documentation</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          VoiceFloo User Guide
        </h1>
        
        <p className="text-xs text-slate-400 leading-relaxed max-w-[400px] mx-auto">
          Learn how to customize shortcuts, grant permissions, and use voice commands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start select-text text-xs">
        
        {/* Sidebar Navigation */}
        <div className="p-5 rounded-2xl border border-white/5 bg-[#050710]/40 space-y-4 select-none">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Chapters</h3>
          <nav className="flex flex-col gap-2.5 font-bold text-slate-400">
            <a href="#getting-started" className="hover:text-cyan-400 transition-colors">1. Getting Started</a>
            <a href="#window-controls" className="hover:text-cyan-400 transition-colors">2. Window Management</a>
            <a href="#insertion-strategies" className="hover:text-cyan-400 transition-colors">3. Input Strategies</a>
            <a href="#voice-commands" className="hover:text-cyan-400 transition-colors">4. Voice Shortcuts</a>
            <a href="#privacy" className="hover:text-cyan-400 transition-colors">5. Security & Privacy</a>
          </nav>
        </div>

        {/* Core documentation text */}
        <div className="md:col-span-2 space-y-12">
          
          {/* Chapter 1: Getting Started */}
          <section id="getting-started" className="space-y-4">
            <h2 className="text-md font-bold text-white border-b border-white/5 pb-2 uppercase tracking-wide">
              1. Getting Started
            </h2>
            <p className="text-slate-400 leading-relaxed">
              When launching VoiceFloo for the first time, you will see a setup wizard overlay. Follow the instructions to download the speech model, select your language preference, and verify your microphone level peaks.
            </p>
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
              <h4 className="font-bold text-white">Default Hotkey Shortcut:</h4>
              <p className="text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono text-[10px] border border-white/5">Ctrl + Shift + Space</kbd> to launch the recorder instantly from any background window.
              </p>
            </div>
          </section>

          {/* Chapter 2: Window Controls */}
          <section id="window-controls" className="space-y-4">
            <h2 className="text-md font-bold text-white border-b border-white/5 pb-2 uppercase tracking-wide">
              2. Window Management
            </h2>
            <p className="text-slate-400 leading-relaxed">
              VoiceFloo operates in a borderless Liquid Glass visual tray. The card stays on top of other applications, rounding borders, and hiding from Windows taskbars when minimized to stay accessible without getting in your way.
            </p>
          </section>

          {/* Chapter 3: Insertion Strategies */}
          <section id="insertion-strategies" className="space-y-4">
            <h2 className="text-md font-bold text-white border-b border-white/5 pb-2 uppercase tracking-wide">
              3. Input Strategies
            </h2>
            <p className="text-slate-400 leading-relaxed">
              VoiceFloo features two distinct text-insertion strategies configured inside the settings menu:
            </p>
            <ul className="space-y-3 pl-4">
              <li className="list-disc leading-relaxed text-slate-350">
                <strong>Keyboard Emulation (Live Streaming)</strong>: Simulates keyboard events to type text word-by-word into text fields as you speak, providing real-time feedback.
              </li>
              <li className="list-disc leading-relaxed text-slate-350">
                <strong>Clipboard Copy-Paste (Instant flushes)</strong>: Overwrites the text field instantly when recording stops, backing up and restoring your original clipboard payloads.
              </li>
            </ul>
          </section>

          {/* Chapter 4: Voice Shortcuts */}
          <section id="voice-commands" className="space-y-4">
            <h2 className="text-md font-bold text-white border-b border-white/5 pb-2 uppercase tracking-wide">
              4. Voice Shortcuts
            </h2>
            <p className="text-slate-400 leading-relaxed">
              When Voice Commands are enabled in settings, speaking the following phrases executes standard editing shortcuts rather than printing literal characters:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider">
                    <th className="py-2.5 font-bold">Verbal Phrase</th>
                    <th className="py-2.5 font-bold">Emulated Keypress Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                  <tr><td className="py-2.5">"new line"</td><td className="py-2.5">Presses Enter</td></tr>
                  <tr><td className="py-2.5">"new paragraph"</td><td className="py-2.5">Presses Enter twice</td></tr>
                  <tr><td className="py-2.5">"tab key"</td><td className="py-2.5">Presses Tab</td></tr>
                  <tr><td className="py-2.5">"delete last word"</td><td className="py-2.5">Presses Ctrl + Backspace</td></tr>
                  <tr><td className="py-2.5">"undo last action"</td><td className="py-2.5">Presses Ctrl + Z</td></tr>
                  <tr><td className="py-2.5">"redo last action"</td><td className="py-2.5">Presses Ctrl + Y</td></tr>
                  <tr><td className="py-2.5">"select all"</td><td className="py-2.5">Presses Ctrl + A</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Chapter 5: Security & Privacy */}
          <section id="privacy" className="space-y-4 pb-12">
            <h2 className="text-md font-bold text-white border-b border-white/5 pb-2 uppercase tracking-wide">
              5. Security & Privacy
            </h2>
            <p className="text-slate-400 leading-relaxed">
              VoiceFloo runs completely offline on your device. Local transcription means zero telemetry streams, zero cloud servers, and zero audio storage outside the user's workspace directories.
            </p>
          </section>

        </div>

      </div>

    </div>
  )
}
