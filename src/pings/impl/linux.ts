import { execSync } from "child_process";

export default () => {
    try {
        // -l lists windows, -x includes the class name
        const output = execSync("wmctrl -l -x", { encoding: "utf8" });
        const lines = output.split("\n");

        for (const line of lines) {
            if (line.toLowerCase().includes("discord.discord")) {
                const match = line.match(/\((\d+)\)/);
                if (match) return parseInt(match[1], 10);
            }
        }
    } catch (e) {
        console.error("Make sure wmctrl is installed (sudo apt install wmctrl)");
    }
    return 0;
}
