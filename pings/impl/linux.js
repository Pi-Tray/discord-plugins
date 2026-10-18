"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.on_ping_count_change = exports.teardown = exports.init = void 0;
const node_child_process_1 = require("node:child_process");
const rpc_1 = require("./rpc");
const pollIntervalMs = 1000;
// polls the active window's class via xdotool and reports whether it belongs to Discord
const watch_foreground = (on_discord_focus) => {
    let warned = false;
    const poll = () => {
        (0, node_child_process_1.execFile)("xdotool", ["getactivewindow", "getwindowclassname"], { encoding: "utf8" }, (error, stdout) => {
            if (error) {
                if (!warned) {
                    warned = true;
                    console.error("Make sure xdotool is installed (sudo apt install xdotool)");
                }
                return;
            }
            // class name is e.g. "discord" or "discord.Discord"
            on_discord_focus(stdout.trim().toLowerCase().includes("discord"));
        });
    };
    poll();
    const timer = setInterval(poll, pollIntervalMs);
    return () => clearInterval(timer);
};
_a = (0, rpc_1.create_rpc_impl)(watch_foreground), exports.init = _a.init, exports.teardown = _a.teardown, exports.on_ping_count_change = _a.on_ping_count_change;
