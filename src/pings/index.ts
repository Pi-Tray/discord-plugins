import type {Plugin} from "pi-tray-server/src/types";
import {load_impl} from "./impl";

export default {
    display_name: "Show the number of Discord notifications",
    description: "[Make a Discord application](https://discord.com/developers/applications) and add http://localhost as a redirect in OAuth.",

    config_template: {
        client_id: {
            type: "string",
            description: "Client ID of the Discord application you made"
        },
        client_secret: {
            type: "string",
            hints: ["password"],
            description: "Client secret of the Discord application you made"
        },
        label: {
            type: "string",
            optional: true,
            description: "Text before the number (default: `Discord:`)" // TODO: fancier format using svg as label
        }
    },

    // TODO: push to open discord

    live: {
        controls: ["label"],

        init({config, update, signal}) {
            load_impl().then(impl => {
                impl.init(config);

                const label = config.label ?? "Discord:";
                impl.on_ping_count_change((count => {
                    update({text: `${label} ${count}`});
                }));

                update({text: `${label} …`});
                signal.addEventListener("abort", impl.teardown);
            });
        }
    }
} satisfies Plugin;
