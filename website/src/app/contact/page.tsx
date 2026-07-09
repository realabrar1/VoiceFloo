'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Mail, MessageSquare, ArrowRight, HelpCircle } from 'lucide-react'

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

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return
    setSubmitted(true)
  }

  return (
    <div className="w-full bg-[#000000] text-[#f0f0f0] min-h-screen py-24">
      <div className="site-container max-w-[1000px] space-y-16">
        
        {/* Header */}
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#292d30] text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider select-none">
            <Mail className="w-4 h-4 text-[#9281f7]" />
            <span>Support channels</span>
          </div>
          
          <h1 className="text-[56px] leading-[1.1] font-domaine font-normal text-white">
            Connect
          </h1>
          
          <p className="text-[16px] text-[#a1a4a5] leading-relaxed max-w-md mx-auto">
            Get technical assistance, submit bug reports, or join our community developers.
          </p>
        </div>

        {/* Layout Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Email Support Form */}
          <div className="p-8 rounded-xl border border-[#292d30] bg-[#000000] space-y-6">
            <h3 className="text-[20px] font-medium text-white tracking-tight">
              Email Support
            </h3>
            
            {submitted ? (
              <div className="p-6 rounded border border-[#3ad389]/20 bg-[#000000] text-center space-y-3 font-mono text-[13px]">
                <span className="status-dot status-dot-delivered" />
                <p className="text-white font-medium">Message Dispatched</p>
                <p className="text-[#a1a4a5]">We will review your support tickets inside 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[12px] font-mono text-[#a1a4a5] uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#000000] border border-[#292d30] hover:border-[#a1a4a5] focus:border-[#9281f7] text-[#f0f0f0] rounded px-4 py-3 text-[14px] outline-none transition-colors font-sans"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[12px] font-mono text-[#a1a4a5] uppercase tracking-wider block">Message Details</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Detail your question or bug context..."
                    className="w-full bg-[#000000] border border-[#292d30] hover:border-[#a1a4a5] focus:border-[#9281f7] text-[#f0f0f0] rounded px-4 py-3 text-[14px] outline-none transition-colors resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5"
                  style={{ backgroundColor: '#3b9eff' }}
                >
                  <span>Submit Support Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: GitHub & Community Integrations */}
          <div className="space-y-8 text-left">
            {/* GitHub Issues */}
            <div className="p-8 rounded-xl border border-[#292d30] bg-[#000000] space-y-4">
              <div className="w-10 h-10 rounded bg-[#000000] border border-[#292d30] flex items-center justify-center text-white">
                <GithubIcon className="w-5 h-5" />
              </div>
              <h4 className="text-[18px] font-medium text-white tracking-tight">Bug Reports & Issues</h4>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                Found a bug with audio buffers or keypress simulations? Submit structured issues directly on our repository.
              </p>
              <a
                href="https://github.com/realabrar1/VoiceFloo/issues"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-mono text-[#9281f7] hover:text-[#baa7ff] transition-colors uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Open GitHub Issues</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Discord Community */}
            <div className="p-8 rounded-xl border border-[#292d30] bg-[#000000] space-y-4">
              <div className="w-10 h-10 rounded bg-[#000000] border border-[#292d30] flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-[18px] font-medium text-white tracking-tight">Developer Community</h4>
              <p className="text-[14px] text-[#a1a4a5] leading-relaxed">
                Join our Discord community to discuss model weights optimization, customization tips, and release schedules.
              </p>
              <a
                href="https://discord.gg/voicefloo"
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-mono text-[#9281f7] hover:text-[#baa7ff] transition-colors uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Join Discord Group</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
