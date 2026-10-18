"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
const rpc_1 = require("./impl/rpc");
const node_path_1 = __importDefault(require("node:path"));
exports.default = {
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
        init({ config, update, signal, data_dir }) {
            (0, rpc_1.set_token_path)(node_path_1.default.join(data_dir, "discord_token.json"));
            (0, impl_1.load_impl)().then(impl => {
                var _a;
                impl.init(config);
                const label = (_a = config.label) !== null && _a !== void 0 ? _a : "Discord:";
                impl.on_ping_count_change((count => {
                    update({ text: `${label} ${count}` });
                }));
                update({ text: `${label} …` });
                signal.addEventListener("abort", impl.teardown);
            });
        }
    }
};
