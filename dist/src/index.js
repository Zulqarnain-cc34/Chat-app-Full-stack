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
        appId: process.env.,
        key: process.env.key,
        secret: process.env.secret,
        cluster: process.env.cluster,
        useTLS: true
    });
    yield console.log(pusher);
    yield pusher.trigger("my-channel", "my-event", {
        message: "hello world"
    });
    yield typeorm_1.createConnection({
        type: "postgres",
        host: process.env.POSTGRES_HOST,
        port: 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        logging: true,
        synchronize: true,
        entities: [Post_1.Post, User_1.User],
    });
    const app = express_1.default();
    const port = process.env.NODE_PORT;
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [PostResolver_1.PostResolver, UserResolver_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res }),
    });
    app.disable('x-powered-by');
    app.use(ratelimiter_1.rateLimiter(redis_1.redisClient));
    app.use(cookie_parser_1.default());
    app.use(cors_1.default(cors_2.myUrl()));
    app.use(helmet_1.default());
    app.use(lypd_1.lypdCookie);
    apolloServer.applyMiddleware({ app });
    app.listen(port, () => {
        console.log(`listening on port : ${port}`);
    });
});
main().catch((err) => console.log(err));
//# sourceMappingURL=index.js.map