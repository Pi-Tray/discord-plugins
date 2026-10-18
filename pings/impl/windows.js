"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.on_ping_count_change = exports.teardown = exports.init = void 0;
const node_child_process_1 = require("node:child_process");
const node_readline_1 = __importDefault(require("node:readline"));
const rpc_1 = require("./rpc");
const discordProcessNames = new Set(["discord", "discordptb", "discordcanary"]);
// polls the foreground window's process name and reports whether it belongs to Discord
const watch_foreground = (on_discord_focus) => {
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
    const watcher = (0, node_child_process_1.spawn)("powershell", ["-NoProfile", "-Command", script]);
    node_readline_1.default.createInterface({ input: watcher.stdout }).on("line", (line) => {
        on_discord_focus(discordProcessNames.has(line.trim().toLowerCase()));
    });
    watcher.stderr.on("data", (data) => process.stderr.write(data));
    return () => watcher.kill();
};
_a = (0, rpc_1.create_rpc_impl)(watch_foreground), exports.init = _a.init, exports.teardown = _a.teardown, exports.on_ping_count_change = _a.on_ping_count_change;
