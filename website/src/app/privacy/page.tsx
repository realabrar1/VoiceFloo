import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-16 md:py-24 text-left select-text text-xs space-y-6">
      <h1 className="text-2xl font-black text-white tracking-tight border-b border-white/5 pb-3">
        Privacy Policy
      </h1>
      <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
        Last Updated: July 8, 2026
      </p>

      <p className="text-slate-400 leading-relaxed">
        At VoiceFloo, privacy is not a secondary configuration option—it is the core architecture. We do not gather, store, or stream your microphone recordings or transcripts.
      </p>

      <h3 className="text-xs font-bold text-white uppercase tracking-wider pt-4">
        1. Local Data Processing
      </h3>
      <p className="text-slate-400 leading-relaxed">
        All audio recordings captured via your hardware inputs are processed locally on your CPU using pre-downloaded GGML speech models. No voice frames or compiled texts are dispatched to network servers.
      </p>

      <h3 className="text-xs font-bold text-white uppercase tracking-wider pt-4">
        2. Offline Functionality
      </h3>
      <p className="text-slate-400 leading-relaxed">
        VoiceFloo operates autonomously without internet connections. Telemetry files or analytics metrics are disabled to avoid background transmissions.
      </p>

      <h3 className="text-xs font-bold text-white uppercase tracking-wider pt-4">
        3. Updates
      </h3>
      <p className="text-slate-400 leading-relaxed">
        Optional automatic updates query GitHub public release endpoints to fetch new setup binary packages.
      </p>
    </div>
  )
}
