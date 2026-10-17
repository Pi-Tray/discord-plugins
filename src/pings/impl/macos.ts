import {execFile} from "node:child_process";

import {create_rpc_impl, ForegroundWatcher} from "./rpc";

const pollIntervalMs = 1000;

// polls the frontmost application via AppleScript and reports whether it is Discord
const watch_foreground: ForegroundWatcher = (on_discord_focus) => {
    const script = `tell application "System Events" to get name of first application process whose frontmost is true`;

    const poll = () => {
        execFile("osascript", ["-e", script], {encoding: "utf8"}, (error, stdout) => {
            // fails quietly if nothing can be read (e.g. missing accessibility permissions)
            if (error) return;
            on_discord_focus(stdout.trim().toLowerCase() === "discord");
        });
    };

    poll();
    const timer = setInterval(poll, pollIntervalMs);

    return () => clearInterval(timer);
};

export const {init, teardown, on_ping_count_change} = create_rpc_impl(watch_foreground);
