import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

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
      <body className="min-h-full flex flex-col bg-[#000000] text-[#f0f0f0]">

        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#292d30] bg-[#000000f2] backdrop-blur-[25px]">
          <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group select-none">
              <img src="/icon.svg" className="w-20 h-20 object-contain" alt="VoiceFloo Logo" />
              <span className="font-semibold text-[15px] text-white font-abc">
                VoiceFloo
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-[14px] font-normal text-[#f0f0f0] hover:text-[#ffffff] transition-colors">
                Features
              </Link>
              <Link href="/download" className="text-[14px] font-normal text-[#f0f0f0] hover:text-[#ffffff] transition-colors">
                Download
              </Link>
              <Link href="/changelog" className="text-[14px] font-normal text-[#f0f0f0] hover:text-[#ffffff] transition-colors">
                Changelog
              </Link>
              <Link href="/docs" className="text-[14px] font-normal text-[#f0f0f0] hover:text-[#ffffff] transition-colors">
                Docs
              </Link>
              <Link href="/contact" className="text-[14px] font-normal text-[#f0f0f0] hover:text-[#ffffff] transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/download"
                className="btn-ghost"
                style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px' }}
              >
                Download
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col justify-start bg-[#000000]">{children}</main>

        {/* Minimal Resend-Style Footer */}
        <footer className="w-full border-t border-[#292d30] bg-[#000000] py-8">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center gap-6">
            <Link href="/privacy" className="text-[14px] font-normal text-[#a1a4a5] hover:text-[#ffffff] transition-colors">
              Privacy
            </Link>
            <span className="text-[#292d30]">•</span>
            <Link href="/terms" className="text-[14px] font-normal text-[#a1a4a5] hover:text-[#ffffff] transition-colors">
              Terms
            </Link>
          </div>
        </footer>

      </body>
    </html>
  )
}
