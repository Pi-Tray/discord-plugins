import {spawn} from "node:child_process";
import readline from "node:readline";

import {create_rpc_impl, ForegroundWatcher} from "./rpc";

const discordProcessNames = new Set(["discord", "discordptb", "discordcanary"]);

// polls the foreground window's process name and reports whether it belongs to Discord
const watch_foreground: ForegroundWatcher = (on_discord_focus) => {
    const script = `
    Add-Type -Name Foreground -Namespace Win32 -MemberDefinition '
      [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
      [DllImport("user32.dll")] public static extern int GetWindowThreadProcessId(IntPtr hwnd, out int processId);
    '
    while ($true) {
      $processId = 0
      [void][Win32.Foreground]::GetWindowThreadProcessId([Win32.Foreground]::GetForegroundWindow(), [ref]$processId)
      $processName = ""
      try { $processName = (Get-Process -Id $processId -ErrorAction Stop).ProcessName } catch { }
      [Console]::Out.WriteLine($processName)
      [Console]::Out.Flush()
      Start-Sleep -Milliseconds 1000
    }
  `;

    const watcher = spawn("powershell", ["-NoProfile", "-Command", script]);
    readline.createInterface({input: watcher.stdout}).on("line", (line) => {
        on_discord_focus(discordProcessNames.has(line.trim().toLowerCase()));
    });
    watcher.stderr.on("data", (data) => process.stderr.write(data));

    return () => watcher.kill();
};

export const {init, teardown, on_ping_count_change} = create_rpc_impl(watch_foreground);
