import React from 'react'

export default function TermsPage() {
  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-16 md:py-24 text-left select-text text-xs space-y-6">
      <h1 className="text-2xl font-black text-white tracking-tight border-b border-white/5 pb-3">
        Terms of Service
      </h1>
      <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
        Last Updated: July 8, 2026
      </p>

      <p className="text-slate-400 leading-relaxed">
        VoiceFloo is free and open-source desktop software distributed under standard developer licenses. By utilizing the software, you accept these terms.
      </p>

      <h3 className="text-xs font-bold text-white uppercase tracking-wider pt-4">
        1. License & Reuse
      </h3>
      <p className="text-slate-400 leading-relaxed">
        You are free to compile, fork, distribute, and alter the codebase under the terms of the project's open-source license.
      </p>

      <h3 className="text-xs font-bold text-white uppercase tracking-wider pt-4">
        2. Software Provided As-Is
      </h3>
      <p className="text-slate-400 leading-relaxed">
        The application is provided "as is", without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability.
      </p>
    </div>
  )
}
