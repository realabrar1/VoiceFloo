import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] shadow-black/40 before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/[0.06] before:to-transparent ${className}`}
    >
      {/* Top border highlight glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  )
}
