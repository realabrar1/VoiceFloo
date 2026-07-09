import React from 'react'
import { motion } from 'framer-motion'

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
      {/* Base dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-[#101826] to-[#1A2235]" />

      {/* Floating Purple Orb */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/15 blur-[80px]"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.15, 0.9, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Cyan/Blue Orb */}
      <motion.div
        className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-cyan-500/10 blur-[100px]"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 0.9, 1.2, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Deep Blue Center Highlight */}
      <motion.div
        className="absolute top-[30%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[90px]"
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
