'use client'

import React, { useState } from 'react'
import { Sparkles, Command, Shield, Mic, CheckCircle2, ChevronRight, Terminal, BookOpen, ExternalLink, HelpCircle } from 'lucide-react'

// Syntax highlighted code component using Commit Mono
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  return (
    <div className="rounded-lg border border-[#292d30] bg-[#000000] overflow-hidden text-left font-commit text-[13px] shadow-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[#000000] border-b border-[#292d30] select-none text-[#a1a4a5] text-[11px] uppercase tracking-wider">
        <span>{language}</span>
        <Terminal className="w-3.5 h-3.5" />
      </div>
      <pre className="p-4 overflow-x-auto text-[#f0f0f0] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function DocsPage() {
  const [activeChapter, setActiveChapter] = useState('getting-started')

  const chapters = [
    { id: 'getting-started', label: '1. Getting Started' },
    { id: 'installation', label: '2. Installation Guide' },
    { id: 'shortcuts', label: '3. Keyboard Shortcuts' },
    { id: 'models', label: '4. Local Whisper Models' },
    { id: 'faq', label: '5. Technical FAQ' },
    { id: 'troubleshooting', label: '6. Troubleshooting' }
  ]

  const sampleJsonConfig = `{
  "model": "ggml-base.bin",
  "hotkey": "Alt+Space",
  "vad_threshold": 0.5,
  "threads": 4,
  "language": "en"
}`

  return (
    <div className="w-full bg-[#000000] text-[#f0f0f0] min-h-screen py-24">
      <div className="site-container max-w-[1200px] space-y-16">
        
        {/* Header */}
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#292d30] text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider select-none">
            <BookOpen className="w-4 h-4 text-[#9281f7]" />
            <span>Developer Reference</span>
          </div>
          
          <h1 className="text-[56px] leading-[1.1] font-domaine font-normal text-white">
            Documentation
          </h1>
          
          <p className="text-[16px] text-[#a1a4a5] leading-relaxed max-w-md mx-auto">
            Everything you need to set up, customize shortcuts, and optimize VoiceFloo offline models.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          
          {/* Sticky Sidebar Chapter Navigator */}
          <div className="md:col-span-1 space-y-6 sticky top-24 select-none">
            <h3 className="text-[12px] font-mono text-[#6e727a] uppercase tracking-widest border-b border-[#292d30] pb-2">
              Chapters
            </h3>
            <nav className="flex flex-col gap-3 font-mono text-[13px]">
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`#${chapter.id}`}
                  onClick={() => setActiveChapter(chapter.id)}
                  className={`transition-colors hover:text-[#9281f7] text-left ${activeChapter === chapter.id ? 'text-[#9281f7] font-medium' : 'text-[#a1a4a5]'}`}
                >
                  {chapter.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Core documentation text */}
          <div className="md:col-span-3 space-y-16 select-text text-left">
            
            {/* Getting Started */}
            <section id="getting-started" className="space-y-6">
              <h2 className="text-[24px] font-medium text-white tracking-tight border-b border-[#292d30] pb-3">
                1. Getting Started
              </h2>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                VoiceFloo is a native Windows desktop utility that intercepts sound card buffers, translates speech to text completely offline using local weights, and injects transcription strokes natively at the cursor coordinates.
              </p>
              <div className="p-6 rounded-xl border border-[#292d30] bg-[#000000] space-y-3">
                <h4 className="text-[14px] font-medium text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#9281f7]" /> Quick Trigger Hotkey
                </h4>
                <p className="text-[13px] text-[#a1a4a5] leading-relaxed">
                  Hold <kbd className="px-2 py-0.5 rounded bg-[#000000] border border-[#292d30] font-mono text-white text-[12px]">Alt + Space</kbd> globally inside any window to start recording. Release the keys to finish dictating.
                </p>
              </div>
            </section>

            {/* Installation */}
            <section id="installation" className="space-y-6">
              <h2 className="text-[24px] font-medium text-white tracking-tight border-b border-[#292d30] pb-3">
                2. Installation Guide
              </h2>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                Execute the native Windows installer Setup EXE. The utility bundles the whisper C++ BLAS runtime dlls inside programmatic local folders.
              </p>
              <CodeBlock 
                code="msiexec /i VoiceFlooSetup.msi /qn" 
                language="powershell installer command" 
              />
            </section>

            {/* Keyboard Shortcuts */}
            <section id="shortcuts" className="space-y-6">
              <h2 className="text-[24px] font-medium text-white tracking-tight border-b border-[#292d30] pb-3">
                3. Keyboard Shortcuts
              </h2>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                VoiceFloo supports macro replacements of spoken phrases to inject control keystrokes instead of literal text strings. See default bindings below:
              </p>
              
              <div className="overflow-x-auto border border-[#292d30] rounded-lg bg-[#000000] font-mono text-[12px] select-text">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#292d30] text-[#a1a4a5] uppercase tracking-wider bg-[#000000]">
                      <th className="p-4 font-medium">Verbal Command</th>
                      <th className="p-4 font-medium">Emulated Keypress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#292d30] text-[#f0f0f0]">
                    <tr><td className="p-4">&quot;new line&quot;</td><td className="p-4">Presses Enter</td></tr>
                    <tr><td className="p-4">&quot;new paragraph&quot;</td><td className="p-4">Presses Enter twice</td></tr>
                    <tr><td className="p-4">&quot;tab key&quot;</td><td className="p-4">Presses Tab</td></tr>
                    <tr><td className="p-4">&quot;delete word&quot;</td><td className="p-4">Presses Ctrl + Backspace</td></tr>
                    <tr><td className="p-4">&quot;undo command&quot;</td><td className="p-4">Presses Ctrl + Z</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Local Whisper Models */}
            <section id="models" className="space-y-6">
              <h2 className="text-[24px] font-medium text-white tracking-tight border-b border-[#292d30] pb-3">
                4. Local Whisper Models
              </h2>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                Settings are configured inside the application JSON configuration model, stored within system appdata.
              </p>
              <CodeBlock 
                code={sampleJsonConfig} 
                language="config/config.json" 
              />
            </section>

            {/* FAQ */}
            <section id="faq" className="space-y-6">
              <h2 className="text-[24px] font-medium text-white tracking-tight border-b border-[#292d30] pb-3">
                5. Technical FAQ
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[15px] font-medium text-white mb-1">Does this require GPU acceleration?</h4>
                  <p className="text-[14px] text-[#a1a4a5] leading-relaxed">No. The BLAS CPU multi-threading library maps weight layers directly to CPU threads.</p>
                </div>
                <div>
                  <h4 className="text-[15px] font-medium text-white mb-1">Where are speech models stored?</h4>
                  <p className="text-[14px] text-[#a1a4a5] leading-relaxed">Models are stored in your user profile appdata at <code className="text-[#9281f7] font-mono">%APPDATA%\VoiceFloo\models</code>.</p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="space-y-6 pb-12">
              <h2 className="text-[24px] font-medium text-white tracking-tight border-b border-[#292d30] pb-3">
                6. Troubleshooting
              </h2>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                If keystroke injection fails inside administrator windows (like cmd.exe), ensure the utility has been launched with appropriate user access elevations or configure clipboard fallback pasting modes.
              </p>
            </section>

          </div>
        </div>

      </div>
    </div>
  )
}
