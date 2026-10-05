"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
exports.default = () => {
    try {
        // -l lists windows, -x includes the class name
        const output = (0, child_process_1.execSync)("wmctrl -l -x", { encoding: "utf8" });
        const lines = output.split("\n");
        for (const line of lines) {
            if (line.toLowerCase().includes("discord.discord")) {
                const match = line.match(/\((\d+)\)/);
                if (match)
                    return parseInt(match[1], 10);
            }
        }
    }
    catch (e) {
        console.error("Make sure wmctrl is installed (sudo apt install wmctrl)");
    }
    return 0;
};
