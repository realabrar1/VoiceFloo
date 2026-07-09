import { exec } from 'child_process'
import { logger } from './logger.service'

export class KeyboardService {
  private isAssemblyLoaded = false

  /**
   * Initializes the native Win32 SendInput C# wrapper in PowerShell.
   */
  private async loadAssembly(): Promise<void> {
    if (this.isAssemblyLoaded || process.platform !== 'win32') return

    const csharpCode = `
      using System;
      using System.Runtime.InteropServices;

      public class Win32Input {
        [StructLayout(LayoutKind.Sequential)]
        public struct KEYBDINPUT {
          public ushort wVk;
          public ushort wScan;
          public uint dwFlags;
          public uint time;
          public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Explicit)]
        public struct INPUT_UNION {
          [FieldOffset(0)]
          public KEYBDINPUT ki;
        }

        public struct INPUT {
          public uint type;
          public INPUT_UNION u;
        }

        [DllImport("user32.dll", SetLastError = true)]
        public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        public static void SendString(string text) {
          if (string.IsNullOrEmpty(text)) return;
          int len = text.Length;
          INPUT[] inputs = new INPUT[len * 2];

          for (int i = 0; i < len; i++) {
            char c = text[i];
            // Key down
            inputs[i * 2].type = 1; // INPUT_KEYBOARD
            inputs[i * 2].u.ki.wVk = 0;
            inputs[i * 2].u.ki.wScan = c;
            inputs[i * 2].u.ki.dwFlags = 4; // KEYEVENTF_UNICODE

            // Key up
            inputs[i * 2 + 1].type = 1;
            inputs[i * 2 + 1].u.ki.wVk = 0;
            inputs[i * 2 + 1].u.ki.wScan = c;
            inputs[i * 2 + 1].u.ki.dwFlags = 4 | 2; // KEYEVENTF_UNICODE | KEYEVENTF_KEYUP
          }

          SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        }

        public static void SendBackspace(int count) {
          if (count <= 0) return;
          INPUT[] inputs = new INPUT[count * 2];

          for (int i = 0; i < count; i++) {
            // Key down
            inputs[i * 2].type = 1;
            inputs[i * 2].u.ki.wVk = 0x08; // VK_BACK
            inputs[i * 2].u.ki.dwFlags = 0;

            // Key up
            inputs[i * 2 + 1].type = 1;
            inputs[i * 2 + 1].u.ki.wVk = 0x08;
            inputs[i * 2 + 1].u.ki.dwFlags = 2; // KEYEVENTF_KEYUP
          }

          SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        }

        public static void SendCombo(string combo) {
          if (string.IsNullOrEmpty(combo)) return;
          if (combo == "^v") {
            SendCtrlKey(0x56); // VK_V
          } else if (combo == "^z") {
            SendCtrlKey(0x5A); // VK_Z
          } else if (combo == "^y") {
            SendCtrlKey(0x59); // VK_Y
          } else if (combo == "^a") {
            SendCtrlKey(0x41); // VK_A
          } else if (combo == "^c") {
            SendCtrlKey(0x43); // VK_C
          } else if (combo == "^{BACKSPACE}") {
            SendCtrlBackspace();
          } else if (combo == "{TAB}") {
            SendTab();
          } else if (combo == "~" || combo == "{ENTER}") {
            SendEnter();
          }
        }

        private static void SendCtrlKey(ushort vk) {
          INPUT[] inputs = new INPUT[4];
          inputs[0].type = 1; inputs[0].u.ki.wVk = 0x11; inputs[0].u.ki.dwFlags = 0; // Ctrl Down
          inputs[1].type = 1; inputs[1].u.ki.wVk = vk;   inputs[1].u.ki.dwFlags = 0; // Key Down
          inputs[2].type = 1; inputs[2].u.ki.wVk = vk;   inputs[2].u.ki.dwFlags = 2; // Key Up
          inputs[3].type = 1; inputs[3].u.ki.wVk = 0x11; inputs[3].u.ki.dwFlags = 2; // Ctrl Up
          SendInput(4, inputs, Marshal.SizeOf(typeof(INPUT)));
        }

        private static void SendCtrlBackspace() {
          INPUT[] inputs = new INPUT[4];
          inputs[0].type = 1; inputs[0].u.ki.wVk = 0x11; inputs[0].u.ki.dwFlags = 0; // Ctrl Down
          inputs[1].type = 1; inputs[1].u.ki.wVk = 0x08; inputs[1].u.ki.dwFlags = 0; // Backspace Down
          inputs[2].type = 1; inputs[2].u.ki.wVk = 0x08; inputs[2].u.ki.dwFlags = 2; // Backspace Up
          inputs[3].type = 1; inputs[3].u.ki.wVk = 0x11; inputs[3].u.ki.dwFlags = 2; // Ctrl Up
          SendInput(4, inputs, Marshal.SizeOf(typeof(INPUT)));
        }

        private static void SendTab() {
          INPUT[] inputs = new INPUT[2];
          inputs[0].type = 1; inputs[0].u.ki.wVk = 0x09; inputs[0].u.ki.dwFlags = 0; // Tab Down
          inputs[1].type = 1; inputs[1].u.ki.wVk = 0x09; inputs[1].u.ki.dwFlags = 2; // Tab Up
          SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));
        }

        private static void SendEnter() {
          INPUT[] inputs = new INPUT[2];
          inputs[0].type = 1; inputs[0].u.ki.wVk = 0x0D; inputs[0].u.ki.dwFlags = 0; // Enter Down
          inputs[1].type = 1; inputs[1].u.ki.wVk = 0x0D; inputs[1].u.ki.dwFlags = 2; // Enter Up
          SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));
        }
      }
    `.replace(/\\r?\\n/g, ' ').trim()

    return new Promise((resolve) => {
      exec(`powershell -Command "Add-Type -TypeDefinition \\"${csharpCode.replace(/"/g, '\\"')}\\" -ErrorAction SilentlyContinue"`, (err) => {
        if (err) {
          logger.error(`KeyboardService: Failed to compile SendInput wrapper: ${err.message}`)
        } else {
          this.isAssemblyLoaded = true
          logger.info('KeyboardService: Native SendInput C# wrapper compiled successfully.')
        }
        resolve()
      })
    })
  }

  /**
   * Types string text using native Win32 SendInput.
   */
  public async typeText(text: string, delayMs: number = 0): Promise<void> {
    if (text.length === 0) return
    await this.loadAssembly()

    if (process.platform !== 'win32') return

    if (delayMs > 0) {
      for (let i = 0; i < text.length; i++) {
        await this.invokeSendInput(`[Win32Input]::SendString('${text[i].replace(/'/g, "''")}')`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } else {
      await this.invokeSendInput(`[Win32Input]::SendString('${text.replace(/'/g, "''")}')`)
    }
  }

  /**
   * Sends a backspace key sequence to correct text.
   */
  public async sendBackspace(count: number): Promise<void> {
    if (count <= 0) return
    await this.loadAssembly()
    await this.invokeSendInput(`[Win32Input]::SendBackspace(${count})`)
  }

  /**
   * Sends keyboard shortcuts or combos natively.
   */
  public async sendCombo(combo: string): Promise<void> {
    await this.loadAssembly()
    if (combo.startsWith('{BACKSPACE ') && combo.endsWith('}')) {
      const count = parseInt(combo.replace('{BACKSPACE ', '').replace('}', ''), 10)
      if (!isNaN(count)) {
        await this.sendBackspace(count)
        return
      }
    }
    await this.invokeSendInput(`[Win32Input]::SendCombo('${combo}')`)
  }

  private invokeSendInput(command: string): Promise<void> {
    return new Promise((resolve) => {
      exec(`powershell -Command "${command}"`, (err, _stdout, stderr) => {
        if (err) {
          logger.error(`KeyboardService: SendInput invocation failed: ${stderr || err.message}`)
        }
        resolve()
      })
    })
  }
}

export const keyboardService = new KeyboardService()
