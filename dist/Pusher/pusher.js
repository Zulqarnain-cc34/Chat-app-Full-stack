"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.channel = exports.pusher = void 0;
const pusher_1 = __importDefault(require("pusher"));
exports.pusher = new pusher_1.default({
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    appId: process.env.PUSHER_ID,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: process.env.PUSHER_TLS === "true" ? true : false,
    encrypted: process.env.PUSHER_ENCRPT === "true" ? true : false,
});
exports.channel = "lireddit";
//# sourceMappingURL=pusher.js.map