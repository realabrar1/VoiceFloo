import { exec } from 'child_process'
import { logger } from './logger.service'

export interface WindowMetadata {
  pid: number
  executable: string
  title: string
}

export class FocusedWindowService {
  /**
   * Queries the foreground active window on Windows.
   * Resolves with pid, executable process name, and window title metadata.
   */
  public getFocusedWindow(): Promise<WindowMetadata> {
    return new Promise((resolve) => {
      if (process.platform !== 'win32') {
        resolve({
          pid: 0,
          executable: 'unknown',
          title: 'Unsupported Platform'
        })
        return
      }

      // Inline P/Invoke User32.dll methods inside PowerShell
      const rawScript = `
        $code = @'
        using System;
        using System.Runtime.InteropServices;
        public class Win32 {
          [DllImport("user32.dll")]
          public static extern IntPtr GetForegroundWindow();
          [DllImport("user32.dll")]
          public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
        }
'@
        Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
        $hwnd = [Win32]::GetForegroundWindow()
        $pid = 0
        [Win32]::GetWindowThreadProcessId($hwnd, [ref]$pid)
        if ($pid -gt 0) {
          $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
          if ($proc) {
            $title = $proc.MainWindowTitle
            $name = $proc.ProcessName
            ConvertTo-Json @{ pid = $pid; executable = "$name.exe"; title = $title }
          } else {
            ConvertTo-Json @{ pid = 0; executable = "unknown"; title = "" }
          }
        } else {
          ConvertTo-Json @{ pid = 0; executable = "unknown"; title = "" }
        }
      `
      
      // Clean up spacing to pass easily to shell
      const commandString = rawScript.replace(/\r?\n/g, ' ').trim()

      exec(`powershell -Command "${commandString}"`, (err, stdout, stderr) => {
        if (err) {
          logger.error(`FocusedWindowService: Failed to fetch active window: ${stderr || err.message}`)
          resolve({ pid: 0, executable: 'unknown', title: '' })
          return
        }

        try {
          const raw = JSON.parse(stdout.trim())
          resolve({
            pid: Number(raw.pid || 0),
            executable: String(raw.executable || 'unknown'),
            title: String(raw.title || '')
          })
        } catch (e) {
          logger.error(`FocusedWindowService: Failed to parse JSON output: ${stdout}`)
          resolve({ pid: 0, executable: 'unknown', title: '' })
        }
      })
    })
  }
}

export const focusedWindowService = new FocusedWindowService()
