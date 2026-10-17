import type {PluginConfig} from "@pi-tray/types";

import RPC from "discord-rpc";
import fs from "node:fs";
import path from "node:path";

// the client sets accessToken after login, but @types/discord-rpc doesn't declare it
declare module "discord-rpc" {
    interface Client {
        accessToken: string;
    }
}

export interface Impl {
    init: (config: PluginConfig) => void;
    teardown: () => void;
    on_ping_count_change: (cb: (count: number) => void) => void;
}

/**
 * A platform supplies this to say when Discord is the focused window, so the count can be
 * reset to zero once the user has actually seen their notifications.
 * @param on_discord_focus called whenever focus changes, with whether Discord is now focused
 * @returns a function that stops watching
 */
export type ForegroundWatcher = (on_discord_focus: (is_discord_focused: boolean) => void) => () => void;

const redirectUri = "http://localhost";
const scopes = ["rpc", "rpc.notifications.read"];
const tokenPath = path.join(__dirname, "discord-token.json"); // TODO: move to appdata
const reconnectDelayMs = 5000;

/**
 * Builds the shared Discord RPC ping counter. Every platform behaves the same way: count up on each
 * notification, and reset to zero when the user focuses Discord. Only the focus detection differs,
 * so each platform just passes in its own {@link ForegroundWatcher}.
 */
export const create_rpc_impl = (watch_foreground: ForegroundWatcher): Impl => {
    let clientId: string;
    let clientSecret: string;

    let pingCount = 0;
    let callback: ((count: number) => void) | null = null;

    let discordWasFocused = false;
    let stopForegroundWatcher: (() => void) | null = null;

    const setPingCount = (count: number) => {
        if (count === pingCount) return;
        pingCount = count;

        if (callback) callback(pingCount);
    };

    const loadAccessToken = (): string | undefined => {
        try {
            return JSON.parse(fs.readFileSync(tokenPath, "utf8")).accessToken;
        } catch {
            return undefined;
        }
    };

    const saveAccessToken = (accessToken: string) => {
        fs.writeFileSync(tokenPath, JSON.stringify({accessToken}));
    };

    const connect = async (): Promise<void> => {
        const client = new RPC.Client({transport: "ipc"});
        const savedToken = loadAccessToken();
        const loginOptions = {clientId, clientSecret, redirectUri, scopes};

        try {
            await client.login(savedToken ? {...loginOptions, accessToken: savedToken} : loginOptions);
        } catch (error) {
            client.destroy().catch(() => {
            });
            if (savedToken) {
                fs.rmSync(tokenPath, {force: true});
                return connect();
            }
            throw error;
        }

        saveAccessToken(client.accessToken);

        client.on("NOTIFICATION_CREATE", () => setPingCount(pingCount + 1));
        await client.subscribe("NOTIFICATION_CREATE", {});

        client.on("disconnected", () => {
            setTimeout(() => connectWithRetry(), reconnectDelayMs);
        });

        console.log("connected as", client.user?.username);
    };

    const connectWithRetry = () => {
        connect().catch((error) => {
            console.error("discord rpc connection failed:", error.message);
            setTimeout(() => connectWithRetry(), reconnectDelayMs);
        });
    };

    const init = (config: PluginConfig) => {
        clientId = config.client_id;
        clientSecret = config.client_secret;

        if (!clientId || !clientSecret) {
            console.error("Discord client_id and client_secret must be provided in the config.");
            return;
        }

        stopForegroundWatcher = watch_foreground((is_discord_focused) => {
            // reset the count on the rising edge of focus, i.e. once the user looks at Discord
            if (is_discord_focused && !discordWasFocused) setPingCount(0);
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

    const on_ping_count_change = (cb: (count: number) => void) => {
        callback = cb;
    };

    return {init, teardown, on_ping_count_change};
};
