'use client'

import React, { useState } from 'react'
import { Sparkles, Mail, MessageSquare } from 'lucide-react'

// Custom Inline GitHub SVG Icon
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
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

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-16 md:py-24 text-left relative z-10 space-y-12">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/10 bg-blue-900/5 text-[9px] font-bold tracking-widest text-cyan-400 uppercase select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Support Channels</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Get in Touch
        </h1>
        
        <p className="text-xs text-slate-400 leading-relaxed max-w-[400px] mx-auto">
          Have bug reports, feature suggestions, or questions? Reach out to the team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start text-xs leading-normal">
        
        {/* Support channels card */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Community Support</h3>
          <p className="text-slate-400">
            VoiceFloo is maintained by open-source collaborators. You can engage with us directly through the following networks:
          </p>

          <div className="space-y-4 pt-2">
            <a 
              href="https://github.com/voicefloo-org/VoiceFloo/issues" 
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex items-center gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white">
                <GithubIcon className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white">GitHub Issues</h4>
                <p className="text-[10px] text-slate-500">Report errors or query developer tasks</p>
              </div>
            </a>

            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-cyan-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white">Support Email</h4>
                <p className="text-[10px] text-slate-500">support@voicefloo.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form card */}
        <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-xl">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center mx-auto text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Message Transmitted!</h3>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                Thank you. We will check your message and follow up shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-white/20 focus:outline-none resize-none"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-900/30 text-center uppercase tracking-wider"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  )
}
