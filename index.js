"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pings = void 0;
var pings_1 = require("./pings");
Object.defineProperty(exports, "pings", { enumerable: true, get: function () { return __importDefault(pings_1).default; } });
// TODO: mute and deafen toggles using discord-rpc. might need a way to add a "setup" step to plugins first that connects the oauth, both plugins can check it before showing oauth
