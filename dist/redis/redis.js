"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.RedisStore = void 0;
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = __importDefault(require("redis"));
const redisPort = 6379;
exports.RedisStore = connect_redis_1.default(express_session_1.default);
exports.redisClient = redis_1.default.createClient(redisPort);
//# sourceMappingURL=redis.js.map