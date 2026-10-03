import { execSync } from "child_process";

export default () => {
    try {
        // use applescript
        const script = `tell application "System Events" to get name of first window of (every process whose name is "Discord")`;
        const output = execSync(`osascript -e '${script}'`, { encoding: "utf8" });

        const match = output.trim().match(/^\((\d+)\)/);
        if (match) return parseInt(match[1], 10);

    } catch (e) {
        // fails quietly if Discord isn't running or permissions are missing
    }
    return 0;
}
