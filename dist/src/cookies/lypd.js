"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lypdCookie = void 0;
const express_session_1 = __importDefault(require("express-session"));
const constants_1 = require("../constants");
const redis_1 = require("../redis/redis");
exports.lypdCookie = express_session_1.default({
    name: "lypd",
    store: new redis_1.RedisStore({ client: redis_1.redisClient, disableTouch: true }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
        secure: !constants_1.__prod__,
    },
    saveUninitialized: false,
    secret: "sdafosfoasjkflsdjfafa90eolsd",
    resave: false,
});
//# sourceMappingURL=lypd.js.map