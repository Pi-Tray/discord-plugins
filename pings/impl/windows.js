"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koffi_1 = __importDefault(require("koffi"));
const user32 = koffi_1.default.load("user32.dll");
koffi_1.default.proto("bool __stdcall EnumWindowsProc(void* hwnd, void* lParam)");
const EnumWindows = user32.func("bool __stdcall EnumWindows(EnumWindowsProc* func, void* lParam)");
const GetWindowText = user32.func("int __stdcall GetWindowTextW(void* hwnd, _Out_ char16_t* lpString, int nMaxCount)");
exports.default = () => {
    let ping_count = 0;
    const callback = (hwnd, lParam) => {
        const buffer = Buffer.alloc(512);
        const length = GetWindowText(hwnd, buffer, 256);
        if (length > 0) {
            // convert utf16le buffer to string and check if it contains "Discord"
            const title = buffer.toString("utf16le", 0, length * 2);
            if (title.includes("Discord")) {
                const match = title.trim().match(/^\((\d+)\)/);
                if (match)
                    ping_count = parseInt(match[1], 10);
            }
        }
        return true;
    };
    EnumWindows(callback, null);
    return ping_count;
};
