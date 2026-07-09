import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

// Custom Inline GitHub SVG Icon matching Lucide style
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

export const metadata: Metadata = {
  title: 'VoiceFloo — Offline AI Voice Dictation Desktop Utility',
  description: 'Speak. Think. Flow. The premium offline AI voice dictation desktop application for Windows. Powered by whisper.cpp. 100% private, no internet required.',
  keywords: ['AI Voice Dictation', 'Offline Transcription', 'whisper.cpp', 'Wispr Flow Alternative', 'Voice to Text Desktop'],
  openGraph: {
    title: 'VoiceFloo — Offline AI Voice Dictation',
    description: 'Offline AI voice dictation for every application. No internet required, 100% private.',
    type: 'website',
    url: 'https://voicefloo.com'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoiceFloo — Offline AI Voice Dictation',
    description: 'Dictate text anywhere on Windows using offline AI voice recognition.'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#080C19] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#080C19]/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-200 shadow-md">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white group-hover:text-blue-200 transition-colors">
                VoiceFloo
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/download" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                Download
              </Link>
              <Link href="/changelog" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                Changelog
              </Link>
              <Link href="/docs" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                Docs
              </Link>
              <Link href="/contact" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/voicefloo-org/VoiceFloo"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-4.5 h-4.5" />
              </a>
              <Link
                href="/download"
                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-colors border border-blue-500/25 shadow-md shadow-blue-900/30 uppercase tracking-wider"
              >
                Download
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col justify-start">{children}</main>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 bg-[#050710] py-8 text-slate-500 text-xs">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 select-none">
              <Sparkles className="w-4 h-4 text-blue-500/60" />
              <span className="font-bold text-[10px] tracking-widest uppercase text-white/50">VoiceFloo</span>
              <span className="text-[10px] text-slate-600 font-semibold">• v1.0.0</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">
                Support
              </Link>
            </div>

            <div className="text-[10px] text-slate-600">
              © {new Date().getFullYear()} VoiceFloo Technologies. All rights reserved.
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
