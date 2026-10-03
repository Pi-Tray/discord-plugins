import * as os from "node:os";

export const load_impl = async () => {
    if (os.platform() === "win32") {
        return (await import("./windows")).default;
    } else if (os.platform() === "darwin") {
        return (await import("./macos")).default;
    } else {
        return (await import("./linux")).default;
    }
}
