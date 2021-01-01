import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Rooms } from "./entities/Rooms";
import { UsersID } from "./entities/UsersID";
import { UserResolver } from "./resolvers/UserResolver";
import { PostResolver } from "./resolvers/PostResolver";
import { RoomResolver, UsersIdresolver } from "./resolvers/RoomsResolver";
import { __prod__ } from "./constants";
import { rateLimiter } from "./middlewares/ratelimiter";
import { lypdCookie } from "./cookies/lypd";
//import cookieParser from "cookie-parser";
import cors from "cors";
//import { csrfProtection } from "./middlewares/csrf";
import helmet from "helmet";
import dotenv from "dotenv";
import _ from "./../environment";
import http from "http";
import { myUrl } from "./middlewares/cors";
import { redis } from "./redis/redis";
import path from "path";
import { Reply } from "./entities/Reply";
import { ReplyResolver } from "./resolvers/ReplyResolver";

const main = async () => {
    await dotenv.config();
    const conn = await createConnection({
        type:
            process.env.DATABASE_TYPE.type === "postgres"
                ? "postgres"
                : "postgres",
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        migrations: [path.join(__dirname, "./migrations/*")],
        logging: process.env.DATABASE_LOG === "true" ? true : false,
        synchronize: process.env.DATABASE_SYNC === "true" ? true : false,
        entities: [Post, User, Rooms, UsersID, Reply],
    });

    const app = express();

    //Redis Connection initialization and setup of configuration
    //intialization of connection,creating redis client and setting up of store
    //port of the redis server not necessary

    //MiddleWares

    await app.set("trust proxy", true);
    await app.disable("x-powered-by");
    await app.use(cors(myUrl()));
    await app.use(rateLimiter(redis));
    await app.use(lypdCookie);

    //app.use(csrfProtection());
    await app.use(
        helmet({
            contentSecurityPolicy:
                process.env.NODE_ENV === "production" ? undefined : false,
        })
    );

    //using redis in application and starting a session
    //intialization of cookies as well

    //http server
    const httpServer = await http.createServer(app);

    const port: string = await process.env.NODE_PORT;

    //Starting the apollo server with my user and post reslovers
    const apolloServer: ApolloServer = await new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                PostResolver,
                UserResolver,
                RoomResolver,
                UsersIdresolver,
                ReplyResolver,
            ],
            validate: false,
        }),
        subscriptions: {
            path: "/subscriptions",
        },
        context: ({ req, res }) => ({ req, res, redis }),
    });
    await apolloServer.applyMiddleware({ app, cors: false });
    await apolloServer.installSubscriptionHandlers(httpServer);

    await httpServer.listen(port, () => {
        console.log(
            `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
        );
        //console.log(
        //    `🚀 Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`
        //);
    });
};

main().catch((err) => console.log(err));
