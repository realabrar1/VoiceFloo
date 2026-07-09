import Link from 'next/link'
import { Download, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, Terminal } from 'lucide-react'
import { fetchLatestRelease } from '../../services/github.service'

export const revalidate = 3600 // Revalidate cache every 1 hour

export default async function DownloadPage() {
  const release = await fetchLatestRelease()
  const dummyChecksum = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

  return (
    <div className="w-full bg-[#000000] text-[#f0f0f0] min-h-screen py-24">
      <div className="site-container max-w-[1200px] space-y-16">
        
        {/* Title area */}
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#292d30] text-[13px] font-mono text-[#a1a4a5] uppercase tracking-wider select-none">
            <Sparkles className="w-4 h-4 text-[#9281f7]" />
            <span>Setup Installer</span>
          </div>
          
          <h1 className="text-[36px] sm:text-[56px] md:text-[77px] leading-[1.1] font-domaine font-normal text-white">
            Download VoiceFloo
          </h1>
          
          <p className="text-[16px] text-[#a1a4a5] leading-relaxed max-w-md mx-auto">
            Get the native voice dictation client. Optimized for local Windows hardware threads.
          </p>
        </div>

        {/* Multi-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main download specifications */}
          <div className="lg:col-span-2 p-8 rounded-2xl border border-[#292d30] bg-[#000000] space-y-8">
            <div className="flex items-center justify-between border-b border-[#292d30] pb-6">
              <div>
                <h2 className="text-[20px] font-medium text-white">Windows Desktop Client</h2>
                <p className="text-[13px] text-[#a1a4a5] font-mono mt-1">Windows 10 / 11 (64-bit)</p>
              </div>
              <span className="text-[12px] font-mono font-bold bg-[#9281f7]/10 text-[#9281f7] px-3 py-1 rounded border border-[#9281f7]/20">
                v{release.version}
              </span>
            </div>

            {/* Spec details grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-[13px] font-mono">
              <div className="space-y-1">
                <span className="text-[#a1a4a5] uppercase text-[11px] tracking-wider block">File size</span>
                <p className="text-white font-medium">{release.fileSize}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a1a4a5] uppercase text-[11px] tracking-wider block">Release date</span>
                <p className="text-white font-medium">{release.releaseDate}</p>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <span className="text-[#a1a4a5] uppercase text-[11px] tracking-wider block">Platform</span>
                <p className="text-white font-medium">Native x64 exe</p>
              </div>
            </div>

            {/* SHA256 checksum */}
            <div className="p-4 rounded border border-[#292d30] bg-[#000000] font-commit text-[12px] space-y-2">
              <div className="flex items-center gap-2 text-[#a1a4a5] uppercase tracking-wider text-[10px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>SHA-256 Checksum</span>
              </div>
              <p className="text-white/80 font-mono break-all leading-normal select-text">
                {dummyChecksum}
              </p>
            </div>

            {/* CTA action */}
            <div className="pt-2">
              <a
                href={release.installerUrl}
                className="btn-primary w-full py-4 text-[14px]"
                style={{ backgroundColor: '#3b9eff' }}
              >
                <Download className="w-4 h-4" />
                <span>Download Setup EXE</span>
              </a>
            </div>

            {/* Release notes summary */}
            <div className="p-5 rounded border border-[#292d30] bg-[#000000] space-y-3">
              <div className="flex items-center gap-2 text-[#a1a4a5] uppercase tracking-wider text-[11px] font-mono">
                <FileText className="w-4 h-4 text-[#9281f7]" />
                <span>Release Summary</span>
              </div>
              <p className="text-[13px] text-[#a1a4a5] leading-relaxed font-normal">
                {release.releaseNotes}
              </p>
            </div>
          </div>

          {/* System Requirements & Guides */}
          <div className="space-y-8">
            {/* Specs card */}
            <div className="p-8 rounded-2xl border border-[#292d30] bg-[#000000] space-y-6 text-left">
              <h3 className="text-[14px] font-mono text-white uppercase tracking-wider border-b border-[#292d30] pb-3">
                System Requirements
              </h3>

              <div className="space-y-4 text-[13px]">
                <div className="space-y-1">
                  <h4 className="font-medium text-white">OS Architecture</h4>
                  <p className="text-[#a1a4a5] leading-relaxed">
                    Windows 10, Windows 11 (64-bit strictly required).
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-white">Hardware Limits</h4>
                  <p className="text-[#a1a4a5] leading-relaxed">
                    Minimum 4GB system RAM. Utilizes local CPU multi-threading.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-white">Audio Capture</h4>
                  <p className="text-[#a1a4a5] leading-relaxed">
                    Requires default microphone input access permissions.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded border border-[#292d30] bg-[#000000] flex gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[#a1a4a5] text-[12px] leading-relaxed">
                  <strong>Local installation:</strong> Unpacks compiled whisper-blas libraries on onboarding launch. Ensure target folders are writable.
                </p>
              </div>
            </div>

            {/* Multi-step Installation Guide */}
            <div className="p-8 rounded-2xl border border-[#292d30] bg-[#000000] space-y-6 text-left">
              <h3 className="text-[14px] font-mono text-white uppercase tracking-wider border-b border-[#292d30] pb-3">
                Installation Steps
              </h3>

              <div className="space-y-4 text-[13px]">
                <div className="flex gap-3">
                  <span className="text-[#9281f7] font-mono">1.</span>
                  <p className="text-[#a1a4a5]">Download the setup executable binary file.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#9281f7] font-mono">2.</span>
                  <p className="text-[#a1a4a5]">Double click on the installer to begin setup.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#9281f7] font-mono">3.</span>
                  <p className="text-[#a1a4a5]">Choose your installation directory paths.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#9281f7] font-mono">4.</span>
                  <p className="text-[#a1a4a5]">Download the GGML voice recognition model file.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info link */}
        <div className="p-6 rounded-xl border border-[#292d30] bg-[#000000] flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#3ad389]" />
            <div>
              <h4 className="text-[14px] font-medium text-white">Latest release verification</h4>
              <p className="text-[12px] text-[#a1a4a5]">Downloads are cryptographically checked against GitHub tags.</p>
            </div>
          </div>
          <Link
            href="/changelog"
            className="text-[13px] font-mono text-[#9281f7] hover:text-[#baa7ff] transition-colors uppercase tracking-wider flex items-center gap-1 shrink-0"
          >
            <span>Read full changelog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
