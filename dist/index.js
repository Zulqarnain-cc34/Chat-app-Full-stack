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
require("reflect-metadata");
const PostResolver_1 = require("./resolvers/PostResolver");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const typeorm_1 = require("typeorm");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const UserResolver_1 = require("./resolvers/UserResolver");
const ratelimiter_1 = require("./middlewares/ratelimiter");
const redis_1 = require("./redis/redis");
const lypd_1 = require("./cookies/lypd");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = require("./middlewares/cors");
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const pusher_1 = __importDefault(require("pusher"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield dotenv_1.default.config();
    const pusher = yield new pusher_1.default({
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        appId: process.env.PUSHER_ID,
        cluster: process.env.PUSHER_CLUSTER,
        useTLS: process.env.PUSHER_TLS === "true" ? true : false
    });
    yield typeorm_1.createConnection({
        type: "postgres",
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        logging: process.env.DATABASE_LOG === "true" ? true : false,
        synchronize: process.env.DATABASE_SYNC === "true" ? true : false,
        entities: [Post_1.Post, User_1.User],
    });
    const app = yield express_1.default();
    const port = yield process.env.NODE_PORT;
    const apolloServer = yield new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [PostResolver_1.PostResolver, UserResolver_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res }),
    });
    yield app.disable('x-powered-by');
    yield app.use(ratelimiter_1.rateLimiter(redis_1.redisClient));
    yield app.use(cookie_parser_1.default());
    yield app.use(cors_1.default(cors_2.myUrl()));
    yield app.use(helmet_1.default({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));
    yield app.use(lypd_1.lypdCookie);
    yield apolloServer.applyMiddleware({ app });
    yield app.listen(port, () => {
        console.log(`listening on port : ${port}`);
    });
});
main().catch((err) => console.log(err));
//# sourceMappingURL=index.js.map