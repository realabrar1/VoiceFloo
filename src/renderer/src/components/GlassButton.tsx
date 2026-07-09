import React from 'react'
import { motion } from 'framer-motion'

interface GlassButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  title?: string
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className = '',
  title
}) => {
  return (
    <motion.button
      onClick={onClick}
      title={title}
      className={`relative overflow-hidden border border-white/10 bg-white/[0.04] text-white backdrop-blur-md shadow-sm transition-colors duration-200 hover:bg-white/[0.08] hover:border-white/15 active:bg-white/[0.02] cursor-pointer flex items-center justify-center group ${className}`}
      whileHover={{ y: -1, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    >
      {/* Subtle shine highlight */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000" />
      <div className="relative z-10">{children}</div>
    </motion.button>
  )
}
