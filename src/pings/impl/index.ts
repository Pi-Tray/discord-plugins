import * as os from "node:os";

import type {Impl} from "./rpc";

export type {Impl};

export const load_impl = async (): Promise<Impl> => {
    if (os.platform() === "win32") {
        return await import("./windows");
    } else if (os.platform() === "darwin") {
        return await import("./macos");
    } else {
        return await import("./linux");
    }
}
