"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_rpc_impl = exports.set_token_path = void 0;
const discord_rpc_1 = __importDefault(require("discord-rpc"));
const node_fs_1 = __importDefault(require("node:fs"));
const redirectUri = "http://localhost";
const scopes = ["rpc", "rpc.notifications.read"];
const reconnectDelayMs = 5000;
let tokenPath = undefined;
const set_token_path = (path) => {
    tokenPath = path;
};
exports.set_token_path = set_token_path;
/**
 * Builds the shared Discord RPC ping counter. Every platform behaves the same way: count up on each
 * notification, and reset to zero when the user focuses Discord. Only the focus detection differs,
 * so each platform just passes in its own {@link ForegroundWatcher}.
 */
const create_rpc_impl = (watch_foreground) => {
    if (!tokenPath) {
        throw new Error("tokenPath must be set before creating the RPC impl");
    }
    let clientId;
    let clientSecret;
    let pingCount = 0;
    let callback = null;
    let discordWasFocused = false;
    let stopForegroundWatcher = null;
    const setPingCount = (count) => {
        if (count === pingCount)
            return;
        pingCount = count;
        if (callback)
            callback(pingCount);
    };
    const loadAccessToken = () => {
        try {
            return JSON.parse(node_fs_1.default.readFileSync(tokenPath, "utf8")).accessToken;
        }
        catch (_a) {
            return undefined;
        }
    };
    const saveAccessToken = (accessToken) => {
        node_fs_1.default.writeFileSync(tokenPath, JSON.stringify({ accessToken }));
    };
    const connect = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const client = new discord_rpc_1.default.Client({ transport: "ipc" });
        const savedToken = loadAccessToken();
        const loginOptions = { clientId, clientSecret, redirectUri, scopes };
        try {
            yield client.login(savedToken ? Object.assign(Object.assign({}, loginOptions), { accessToken: savedToken }) : loginOptions);
        }
        catch (error) {
            client.destroy().catch(() => {
            });
            if (savedToken) {
                node_fs_1.default.rmSync(tokenPath, { force: true });
                return connect();
            }
            throw error;
        }
        saveAccessToken(client.accessToken);
        client.on("NOTIFICATION_CREATE", () => setPingCount(pingCount + 1));
        yield client.subscribe("NOTIFICATION_CREATE", {});
        client.on("disconnected", () => {
            setTimeout(() => connectWithRetry(), reconnectDelayMs);
        });
        console.log("connected as", (_a = client.user) === null || _a === void 0 ? void 0 : _a.username);
    });
    const connectWithRetry = () => {
        connect().catch((error) => {
            console.error("discord rpc connection failed:", error.message);
            setTimeout(() => connectWithRetry(), reconnectDelayMs);
        });
    };
    const init = (config) => {
        clientId = config.client_id;
        clientSecret = config.client_secret;
        if (!clientId || !clientSecret) {
            console.error("Discord client_id and client_secret must be provided in the config.");
            return;
        }
        stopForegroundWatcher = watch_foreground((is_discord_focused) => {
            // reset the count on the rising edge of focus, i.e. once the user looks at Discord
            if (is_discord_focused && !discordWasFocused)
                setPingCount(0);
            discordWasFocused = is_discord_focused;
        });
        connectWithRetry();
    };
    const teardown = () => {
        if (stopForegroundWatcher) {
            stopForegroundWatcher();
            stopForegroundWatcher = null;
        }
    };
    const on_ping_count_change = (cb) => {
        callback = cb;
    };
    return { init, teardown, on_ping_count_change };
};
exports.create_rpc_impl = create_rpc_impl;
