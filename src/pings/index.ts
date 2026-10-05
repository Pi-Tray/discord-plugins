import type {Plugin} from "pi-tray-server/src/types";
import {load_impl} from "./impl";

export default {
    display_name: "Show the number of Discord notifications",
    description: "Uses window title to count the number of Discord notifications.",

    config_template: {
        interval_seconds: {
            type: "number",
            optional: true,
            description: "How often to update (default: 2)"
        },
        label: {
            type: "string",
            optional: true,
            description: "Text before the number (default: `Discord:`)" // TODO: fancier format using svg as label
        }
    },

    // TODO: push to open discord
    // TODO: more robust if window not open

    live: {
        controls: ["label"],

        init({config, update, signal}) {
            load_impl().then(get_ping_count => {
                const interval_ms = Math.max(500, (config.interval_seconds ?? 2) * 1000);
                const label = config.label ?? "Discord:";

                const timer = setInterval(() => {
                    update({text: `${label} ${get_ping_count()}`});
                }, interval_ms);

                update({text: `${label} …`});
                signal.addEventListener("abort", () => clearInterval(timer));
            });
        }
    }
} satisfies Plugin;
