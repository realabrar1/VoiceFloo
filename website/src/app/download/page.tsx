import Link from 'next/link'
import { Download, Sparkles, AlertCircle, FileText, CheckCircle } from 'lucide-react'
import { fetchLatestRelease } from '../../services/github.service'

export const revalidate = 3600 // Revalidate cache every 1 hour

export default async function DownloadPage() {
  const release = await fetchLatestRelease()

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-16 md:py-24 text-center relative z-10">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="space-y-4 max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/10 bg-blue-900/5 text-[9px] font-bold tracking-widest text-cyan-400 uppercase select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Select Installer</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Get VoiceFloo Free
        </h1>
        
        <p className="text-xs text-slate-400 leading-relaxed max-w-[450px] mx-auto">
          Start dictating offline. Runs entirely on your local CPU threads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-start">
        
        {/* Main Installer Card */}
        <div className="md:col-span-2 p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white leading-none">Windows Installer</h2>
              <span className="text-[10px] text-slate-500 mt-1.5 inline-block font-semibold">
                Windows 10 / 11 (64-bit)
              </span>
            </div>
            
            {/* Version Badge */}
            <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-cyan-400 px-3 py-1 rounded-full border border-blue-500/20">
              v{release.version}
            </span>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">File Size</span>
              <p className="text-white font-bold">{release.fileSize}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Release Date</span>
              <p className="text-white font-bold">{release.releaseDate}</p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={release.installerUrl}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/35 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-center"
            >
              <Download className="w-4 h-4" />
              <span>Download VoiceFloo Setup.exe</span>
            </a>
          </div>

          {/* Release logs box */}
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] space-y-2 select-text text-xs">
            <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-wider text-[9px]">
              <FileText className="w-3.5 h-3.5" />
              <span>Latest Release Notes</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              {release.releaseNotes}
            </p>
          </div>
        </div>

        {/* Requirements Card */}
        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
            System Specifications
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-white/80">Windows Compatibility</h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                Windows 10, Windows 11 (64-bit architecture only).
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-white/80">CPU / RAM</h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                Minimum 4GB RAM. Dictation models utilize CPU multi-threading.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-white/80">Accessibility access</h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                Requires standard user keyboard focus overrides to support typing.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-yellow-500/10 bg-yellow-950/5 flex gap-2.5 text-left text-xs select-text">
            <AlertCircle className="w-4.5 h-4.5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-slate-400 text-[10px] leading-relaxed">
              <strong>Offline notice:</strong> The setup installer checks and unzips whisper-blas binary executables on first boot. Make sure you complete the onboarding downloader to verify microphone lines.
            </p>
          </div>
        </div>

      </div>

      {/* Cross-platform notice */}
      <div className="mt-16 p-6 rounded-2xl border border-white/5 bg-[#050710]/40 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Looking for macOS or Linux?</h4>
            <p className="text-[10px] text-slate-500">Auto-update support for Apple Silicon and Linux targets are under development.</p>
          </div>
        </div>
        <Link
          href="/changelog"
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
        >
          View Full Release Changelog
        </Link>
      </div>

    </div>
  )
}
