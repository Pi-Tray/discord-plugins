"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.on_ping_count_change = exports.teardown = exports.init = void 0;
const node_child_process_1 = require("node:child_process");
const rpc_1 = require("./rpc");
const pollIntervalMs = 1000;
// polls the frontmost application via AppleScript and reports whether it is Discord
const watch_foreground = (on_discord_focus) => {
    const script = `tell application "System Events" to get name of first application process whose frontmost is true`;
    const poll = () => {
        (0, node_child_process_1.execFile)("osascript", ["-e", script], { encoding: "utf8" }, (error, stdout) => {
            // fails quietly if nothing can be read (e.g. missing accessibility permissions)
            if (error)
                return;
            on_discord_focus(stdout.trim().toLowerCase() === "discord");
        });
    };
    poll();
    const timer = setInterval(poll, pollIntervalMs);
    return () => clearInterval(timer);
};
_a = (0, rpc_1.create_rpc_impl)(watch_foreground), exports.init = _a.init, exports.teardown = _a.teardown, exports.on_ping_count_change = _a.on_ping_count_change;
