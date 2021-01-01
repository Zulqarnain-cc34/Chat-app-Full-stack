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
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const typeorm_1 = require("typeorm");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const Rooms_1 = require("./entities/Rooms");
const UsersID_1 = require("./entities/UsersID");
const UserResolver_1 = require("./resolvers/UserResolver");
const PostResolver_1 = require("./resolvers/PostResolver");
const RoomsResolver_1 = require("./resolvers/RoomsResolver");
const ratelimiter_1 = require("./middlewares/ratelimiter");
const lypd_1 = require("./cookies/lypd");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const cors_2 = require("./middlewares/cors");
const redis_1 = require("./redis/redis");
const path_1 = __importDefault(require("path"));
const Reply_1 = require("./entities/Reply");
const ReplyResolver_1 = require("./resolvers/ReplyResolver");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield dotenv_1.default.config();
    const conn = yield typeorm_1.createConnection({
        type: process.env.DATABASE_TYPE.type === "postgres"
            ? "postgres"
            : "postgres",
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        logging: process.env.DATABASE_LOG === "true" ? true : false,
        synchronize: process.env.DATABASE_SYNC === "true" ? true : false,
        entities: [Post_1.Post, User_1.User, Rooms_1.Rooms, UsersID_1.UsersID, Reply_1.Reply],
    });
    const app = express_1.default();
    yield app.set("trust proxy", true);
    yield app.disable("x-powered-by");
    yield app.use(cors_1.default(cors_2.myUrl()));
    yield app.use(ratelimiter_1.rateLimiter(redis_1.redis));
    yield app.use(lypd_1.lypdCookie);
    yield app.use(helmet_1.default({
        contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    }));
    const httpServer = yield http_1.default.createServer(app);
    const port = yield process.env.NODE_PORT;
    const apolloServer = yield new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [
                PostResolver_1.PostResolver,
                UserResolver_1.UserResolver,
                RoomsResolver_1.RoomResolver,
                RoomsResolver_1.UsersIdresolver,
                ReplyResolver_1.ReplyResolver,
            ],
            validate: false,
        }),
        subscriptions: {
            path: "/subscriptions",
        },
        context: ({ req, res }) => ({ req, res, redis: redis_1.redis }),
    });
    yield apolloServer.applyMiddleware({ app, cors: false });
    yield apolloServer.installSubscriptionHandlers(httpServer);
    yield httpServer.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
    });
});
main().catch((err) => console.log(err));
//# sourceMappingURL=index.js.map