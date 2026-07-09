import React from 'react'
import { Settings, Clock, Globe } from 'lucide-react'
import { GlassButton } from './GlassButton'

interface BottomToolbarProps {
  onSettingsClick?: () => void
  onHistoryClick?: () => void
  onLanguageChange?: (lang: string) => void
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onSettingsClick,
  onHistoryClick,
  onLanguageChange
}) => {
  const [lang, setLang] = React.useState('EN')

  const toggleLanguage = () => {
    const nextLang = lang === 'EN' ? 'ES' : lang === 'ES' ? 'DE' : 'EN'
    setLang(nextLang)
    if (onLanguageChange) onLanguageChange(nextLang)
  }

  return (
    <div className="flex items-center justify-between w-full px-5 py-4 border-t border-white/5 bg-black/10 backdrop-blur-md z-30 select-none">
      <div className="flex items-center gap-2.5">
        <GlassButton
          onClick={onSettingsClick}
          title="Settings"
          className="w-9 h-9 rounded-full"
        >
          <Settings className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-200" />
        </GlassButton>
        <GlassButton
          onClick={onHistoryClick}
          title="Dictation History"
          className="w-9 h-9 rounded-full"
        >
          <Clock className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-200" />
        </GlassButton>
      </div>

      <GlassButton
        onClick={toggleLanguage}
        title="Select Recognition Language"
        className="px-3.5 h-9 rounded-full gap-1.5 text-[10px] font-bold tracking-wider"
      >
        <Globe className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors duration-200" />
        <span>{lang}</span>
      </GlassButton>
    </div>
  )
}
