import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.api.minimize()
  }

  const handleMaximize = () => {
    window.api.maximize()
  }

  const handleClose = () => {
    window.api.close()
  }

  return (
    <div className="drag-region flex items-center justify-between w-full h-12 px-5 border-b border-white/5 select-none relative z-50">
      {/* Brand logo & title */}
      <div className="flex items-center gap-2 select-none pointer-events-none">
        {/* Glow point */}
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        <span className="text-[11px] font-bold tracking-widest text-white/40 uppercase">
          VoiceFloo
        </span>
      </div>

      {/* Control Buttons */}
      <div className="no-drag-region flex items-center gap-2">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-white/5 active:bg-white/10 text-white/40 hover:text-white/80 transition-colors duration-150 cursor-pointer"
          title="Minimize to System Tray"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-white/5 active:bg-white/10 text-white/40 hover:text-white/80 transition-colors duration-150 cursor-pointer"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-red-500/20 active:bg-red-500/30 text-white/40 hover:text-red-400 transition-colors duration-150 cursor-pointer"
          title="Hide to Tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
