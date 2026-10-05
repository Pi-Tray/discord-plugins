"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
exports.default = {
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
        init({ config, update, signal }) {
            (0, impl_1.load_impl)().then(get_ping_count => {
                var _a, _b;
                const interval_ms = Math.max(500, ((_a = config.interval_seconds) !== null && _a !== void 0 ? _a : 2) * 1000);
                const label = (_b = config.label) !== null && _b !== void 0 ? _b : "Discord:";
                const timer = setInterval(() => {
                    update({ text: `${label} ${get_ping_count()}` });
                }, interval_ms);
                update({ text: `${label} …` });
                signal.addEventListener("abort", () => clearInterval(timer));
            });
        }
    }
};
