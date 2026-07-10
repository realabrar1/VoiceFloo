import React from 'react'
import { MicState } from './FloatingMicButton'

interface StatusIndicatorProps {
  state: MicState
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
  const getStatusDetails = () => {
    switch (state) {
      case 'recording':
        return { text: 'Recording...', color: 'bg-red-500 animate-pulse', textColor: 'text-red-300' }
      case 'processing':
        return { text: 'Processing Speech...', color: 'bg-indigo-400 animate-bounce', textColor: 'text-indigo-300' }
      case 'error':
        return { text: 'Mic Access Error', color: 'bg-amber-500', textColor: 'text-amber-300' }
      case 'paused':
        return { text: 'Recording Paused', color: 'bg-amber-500 animate-pulse', textColor: 'text-amber-300' }
      case 'success':
        return { text: 'Typed successfully', color: 'bg-emerald-500 animate-pulse', textColor: 'text-emerald-300' }
      case 'idle':
      default:
        return { text: 'Ready', color: 'bg-emerald-500', textColor: 'text-emerald-300' }
    }
  }

  const { text, color, textColor } = getStatusDetails()

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/5 backdrop-blur-sm shadow-inner select-none">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className={`text-[10px] font-bold tracking-wider uppercase ${textColor}`}>
        {text}
      </span>
    </div>
  )
}
