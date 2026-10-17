import {execFile} from "node:child_process";

import {create_rpc_impl, ForegroundWatcher} from "./rpc";

const pollIntervalMs = 1000;

// polls the active window's class via xdotool and reports whether it belongs to Discord
const watch_foreground: ForegroundWatcher = (on_discord_focus) => {
    let warned = false;

    const poll = () => {
        execFile("xdotool", ["getactivewindow", "getwindowclassname"], {encoding: "utf8"}, (error, stdout) => {
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

export const {init, teardown, on_ping_count_change} = create_rpc_impl(watch_foreground);
