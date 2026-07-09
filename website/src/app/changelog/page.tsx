import { ArrowLeft, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { fetchAllReleases } from '../../services/github.service'

export const revalidate = 3600 // Revalidate cache every 1 hour

export default async function ChangelogPage() {
  const releases = await fetchAllReleases()

  return (
    <div className="w-full bg-[#000000] text-[#f0f0f0] min-h-screen py-24">
      <div className="site-container max-w-[800px] space-y-16">
        
        {/* Header */}
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#292d30] text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider select-none">
            <Sparkles className="w-4 h-4 text-[#9281f7]" />
            <span>Changelog timeline</span>
          </div>
          
          <h1 className="text-[56px] leading-[1.1] font-domaine font-normal text-white">
            What&apos;s New
          </h1>
          
          <p className="text-[16px] text-[#a1a4a5] leading-relaxed max-w-md mx-auto">
            Follow the latest releases, feature updates, and optimization changes.
          </p>
        </div>

        {/* Timeline list */}
        <div className="relative border-l border-[#292d30] pl-8 space-y-12">
          {releases.map((release, idx) => (
            <div key={idx} className="relative group">
              
              {/* Timeline bullet indicator */}
              <div className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full border-2 border-[#000000] bg-[#292d30] group-hover:bg-[#9281f7] transition-colors" />

              {/* Version title and date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-[20px] font-medium text-white tracking-tight">
                    v{release.version}
                  </h3>
                  {idx === 0 && (
                    <span className="text-[10px] font-mono font-bold bg-[#9281f7]/10 border border-[#9281f7]/25 text-[#9281f7] px-2.5 py-0.5 rounded">
                      LATEST
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#a1a4a5]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{release.releaseDate}</span>
                </div>
              </div>

              {/* Release notes card */}
              <div className="p-8 rounded-xl border border-[#292d30] bg-[#000000] space-y-4 hover:border-[#a1a4a5] transition-colors">
                <div className="text-[14px] text-[#f0f0f0] leading-relaxed space-y-4 select-text font-sans">
                  {release.changelogNotes.split('\n').map((line, lIdx) => {
                    const trimmed = line.trim()
                    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                      // Check if it's a sub-badge like NEW/FIXED/IMPROVED
                      const cleanedLine = trimmed.replace(/^[-*]\s+/, '')
                      let badge = ''
                      let displayLine = cleanedLine

                      if (cleanedLine.toUpperCase().startsWith('[NEW]')) {
                        badge = 'NEW'
                        displayLine = cleanedLine.slice(5).trim()
                      } else if (cleanedLine.toUpperCase().startsWith('[FIXED]')) {
                        badge = 'FIXED'
                        displayLine = cleanedLine.slice(7).trim()
                      } else if (cleanedLine.toUpperCase().startsWith('[IMPROVED]')) {
                        badge = 'IMPROVED'
                        displayLine = cleanedLine.slice(10).trim()
                      }

                      return (
                        <div key={lIdx} className="flex items-start gap-3 text-[#a1a4a5] text-[13px] leading-relaxed">
                          {badge ? (
                            <span className="font-mono text-[10px] font-semibold bg-[#292d30] text-[#f0f0f0] px-1.5 py-0.5 rounded border border-[#292d30] shrink-0 mt-0.5">
                              {badge}
                            </span>
                          ) : (
                            <span className="text-[#9281f7] font-mono select-none mt-0.5">•</span>
                          )}
                          <span>{displayLine}</span>
                        </div>
                      )
                    }
                    if (trimmed.startsWith('###')) {
                      return (
                        <h4 key={lIdx} className="text-[13px] font-mono font-medium text-[#9281f7] uppercase tracking-wider mt-6 pt-4 border-t border-[#292d30] first:mt-0 first:pt-0 first:border-0">
                          {trimmed.replace(/^###\s+/, '')}
                        </h4>
                      )
                    }
                    if (trimmed.length === 0) return null
                    return <p key={lIdx} className="text-[#a1a4a5] text-[13.5px] leading-relaxed">{trimmed}</p>
                  })}
                </div>

                {release.installerUrl && (
                  <div className="pt-6 border-t border-[#292d30] flex items-center justify-between text-[12px] font-mono">
                    <span className="text-[#6e727a]">File size: {release.fileSize}</span>
                    <a
                      href={release.installerUrl}
                      className="text-[#9281f7] hover:text-[#baa7ff] transition-colors uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>Download setup binary</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </a>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Back navigation */}
        <div className="text-center pt-8">
          <Link
            href="/"
            className="text-[13px] font-mono text-[#a1a4a5] hover:text-white transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

      </div>
    </div>
  )
}
