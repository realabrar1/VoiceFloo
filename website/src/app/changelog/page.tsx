import { ArrowLeft, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { fetchAllReleases } from '../../services/github.service'

export const revalidate = 3600 // Revalidate cache every 1 hour

export default async function ChangelogPage() {
  const releases = await fetchAllReleases()

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-16 md:py-24 relative z-10 text-left">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/10 bg-blue-900/5 text-[9px] font-bold tracking-widest text-cyan-400 uppercase select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Updates</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          What's New in VoiceFloo
        </h1>
        
        <p className="text-xs text-slate-400 leading-relaxed max-w-[400px] mx-auto">
          Track updates, changes, and release cycles from the VoiceFloo release pipeline.
        </p>
      </div>

      {/* Releases list */}
      <div className="relative border-l border-white/5 pl-6 md:pl-8 space-y-12">
        {releases.map((release, idx) => (
          <div key={idx} className="relative group">
            
            {/* Timeline bullet indicator */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-[#080C19] bg-slate-800 flex items-center justify-center text-white/50 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-200">
              <div className="w-1.5 h-1.5 rounded-full bg-[#080C19]" />
            </div>

            {/* Version title and date */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-md font-bold text-white leading-none">
                  v{release.version}
                </h3>
                {idx === 0 && (
                  <span className="text-[8px] font-bold tracking-widest uppercase bg-blue-500/15 border border-blue-500/30 text-cyan-400 px-2 py-0.5 rounded-full">
                    Latest
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{release.releaseDate}</span>
              </div>
            </div>

            {/* Release notes block */}
            <div className="p-5 md:p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative select-text text-xs leading-relaxed text-slate-300 space-y-4">
              {/* Parse notes split by newlines for clean paragraph renders */}
              {release.changelogNotes.split('\n').map((line, lIdx) => {
                const trimmed = line.trim()
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                  return (
                    <li key={lIdx} className="list-disc ml-4 text-slate-350">
                      {trimmed.replace(/^[-*]\s+/, '')}
                    </li>
                  )
                }
                if (trimmed.startsWith('###')) {
                  return (
                    <h4 key={lIdx} className="text-xs font-bold text-white mt-4 border-b border-white/5 pb-1 uppercase tracking-wider">
                      {trimmed.replace(/^###\s+/, '')}
                    </h4>
                  )
                }
                if (trimmed.length === 0) return null
                return <p key={lIdx}>{trimmed}</p>
              })}

              {/* Install download action target */}
              {release.installerUrl && (
                <div className="pt-3.5 border-t border-white/5 mt-4 flex items-center justify-between gap-4">
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">Size: {release.fileSize}</span>
                  <a
                    href={release.installerUrl}
                    className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <span>Download Setup Binary</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </a>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      <div className="text-center pt-16">
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

    </div>
  )
}
