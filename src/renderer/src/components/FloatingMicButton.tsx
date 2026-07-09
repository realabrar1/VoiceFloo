import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, AlertCircle } from 'lucide-react'

export type MicState = 'idle' | 'recording' | 'processing' | 'error' | 'paused'

interface FloatingMicButtonProps {
  state: MicState
  onClick?: () => void
}

export const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({ state, onClick }) => {
  const getColors = () => {
    switch (state) {
      case 'recording':
        return {
          bg: 'bg-red-500/20 border-red-500/40 text-red-200 hover:border-red-400/60',
          glow: 'shadow-[0_0_50px_rgba(239,68,68,0.4)]',
          pulseColor: 'bg-red-500/20'
        }
      case 'processing':
        return {
          bg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200 hover:border-indigo-400/60',
          glow: 'shadow-[0_0_50px_rgba(99,102,241,0.4)]',
          pulseColor: 'bg-indigo-500/20'
        }
      case 'error':
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-200 hover:border-amber-400/60',
          glow: 'shadow-[0_0_50px_rgba(245,158,11,0.4)]',
          pulseColor: 'bg-amber-500/20'
        }
      case 'paused':
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-200 hover:border-amber-400/60',
          glow: 'shadow-[0_0_50px_rgba(245,158,11,0.35)]',
          pulseColor: 'bg-amber-500/15'
        }
      case 'idle':
      default:
        return {
          bg: 'bg-blue-500/20 border-blue-500/45 text-blue-100 hover:border-blue-400/60 hover:text-white',
          glow: 'shadow-[0_0_50px_rgba(59,130,246,0.35)]',
          pulseColor: 'bg-blue-500/15'
        }
    }
  }

  const { bg, glow, pulseColor } = getColors()

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer pulsing background rings */}
      <AnimatePresence>
        {state === 'idle' && (
          <motion.div
            className={`absolute w-40 h-40 rounded-full ${pulseColor} blur-xl`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
        {state === 'recording' && (
          <>
            <motion.div
              className={`absolute w-44 h-44 rounded-full ${pulseColor} blur-xl`}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className={`absolute w-52 h-52 rounded-full bg-red-500/5 blur-2xl`}
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </>
        )}
        {state === 'processing' && (
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-indigo-400/20"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Mic Button */}
      <motion.button
        onClick={onClick}
        className={`relative w-28 h-28 rounded-full border flex items-center justify-center backdrop-blur-3xl transition-all duration-300 z-10 cursor-pointer ${bg} ${glow}`}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      >
        {/* Shine highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-30" />

        {/* Central Icon */}
        <div className="relative z-10">
          {state === 'processing' ? (
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Mic className="w-11 h-11 stroke-[1.5]" />
            </motion.div>
          ) : state === 'error' ? (
            <AlertCircle className="w-11 h-11 stroke-[1.5] text-amber-300" />
          ) : (
            <Mic className="w-11 h-11 stroke-[1.5]" />
          )}
        </div>

        {/* Loading ring spinner for processing state */}
        {state === 'processing' && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <motion.circle
              cx="56"
              cy="56"
              r="53"
              stroke="rgba(129, 140, 248, 0.4)"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray="333"
              animate={{
                strokeDashoffset: [333, 100, 333]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
