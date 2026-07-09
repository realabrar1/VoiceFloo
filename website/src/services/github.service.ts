export interface GitHubRelease {
  version: string
  releaseDate: string
  installerUrl: string
  fileSize: string
  releaseNotes: string
  changelogNotes: string
}

const GITHUB_REPO = 'voicefloo-org/VoiceFloo'

// Fallback release if GitHub is rate-limited or repository is not yet populated with binary files
const FALLBACK_RELEASE: GitHubRelease = {
  version: '1.0.0',
  releaseDate: '2026-07-08',
  installerUrl: 'https://github.com/voicefloo-org/VoiceFloo/releases/download/v1.0.0/voicefloo-1.0.0-setup.exe',
  fileSize: '65.2 MB',
  releaseNotes: 'Core release containing completely offline speech recognition, RMS-based VAD silencers, and Windows keypress injections.',
  changelogNotes: '### Core Release v1.0.0\n\n- **Offline AI Speech Recognition**: Runs whisper.cpp natively on your local machine.\n- **Voice Activity Detection**: RMS-based VAD silences transcription during gaps to reduce CPU load.\n- **Windows Input Engine**: Simulates SendKeys and copy-paste overlays to type text anywhere.\n- **First Launch Wizard**: Easily download models and verify microphone levels.'
}

/**
 * Fetch the newest published release details.
 */
export async function fetchLatestRelease(): Promise<GitHubRelease> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      next: { revalidate: 3600 } // Cache for 1 hour on server-side builds
    })
    
    if (!res.ok) {
      return FALLBACK_RELEASE
    }

    const data = await res.json()
    const asset = data.assets?.find((a: any) => a.name.endsWith('.exe'))
    const sizeMb = asset ? `${(asset.size / 1024 / 1024).toFixed(1)} MB` : '65.2 MB'
    const downloadUrl = asset ? asset.browser_download_url : `https://github.com/${GITHUB_REPO}/releases/download/${data.tag_name}/${data.tag_name}-setup.exe`

    return {
      version: data.tag_name.replace(/^v/, ''),
      releaseDate: new Date(data.published_at).toISOString().split('T')[0],
      installerUrl: downloadUrl,
      fileSize: sizeMb,
      releaseNotes: data.body || 'No release details provided.',
      changelogNotes: data.body || ''
    }
  } catch (err) {
    console.error('Failed to fetch latest GitHub release, returning fallback:', err)
    return FALLBACK_RELEASE
  }
}

/**
 * Fetch all released versions for list changelogs.
 */
export async function fetchAllReleases(): Promise<GitHubRelease[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`, {
      next: { revalidate: 3600 }
    })
    
    if (!res.ok) {
      return [FALLBACK_RELEASE]
    }

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      return [FALLBACK_RELEASE]
    }

    return data.map((item: any) => {
      const asset = item.assets?.find((a: any) => a.name.endsWith('.exe'))
      const sizeMb = asset ? `${(asset.size / 1024 / 1024).toFixed(1)} MB` : '65.2 MB'
      return {
        version: item.tag_name.replace(/^v/, ''),
        releaseDate: new Date(item.published_at).toISOString().split('T')[0],
        installerUrl: asset ? asset.browser_download_url : `https://github.com/${GITHUB_REPO}/releases/download/${item.tag_name}/${item.tag_name}-setup.exe`,
        fileSize: sizeMb,
        releaseNotes: item.body || 'No notes provided.',
        changelogNotes: item.body || ''
      }
    })
  } catch (err) {
    console.error('Failed to fetch GitHub releases list, returning fallback:', err)
    return [FALLBACK_RELEASE]
  }
}
