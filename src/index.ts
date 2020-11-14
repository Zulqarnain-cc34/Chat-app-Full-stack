import "reflect-metadata";
import { PostResolver } from "./resolvers/PostResolver";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/UserResolver";
import { __prod__ } from "./constants";
import { rateLimiter } from "./middlewares/ratelimiter";
import { redisClient } from "./redis/redis";
import { lypdCookie } from "./cookies/lypd";
import cookieParser from "cookie-parser";
import cors from "cors";
import { myUrl } from "./middlewares/cors";
//import { csrfProtection } from "./middlewares/csrf";
import helmet from "helmet";
import dotenv from 'dotenv';
import Pusher from "pusher";
import _ from "./../environment"
const main = async () => {
    await dotenv.config();

    const pusher = await new Pusher({
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        appId: process.env.PUSHER_ID,
        cluster: process.env.PUSHER_CLUSTER,
        useTLS: process.env.PUSHER_TLS === "true" ? true : false
    })


    await createConnection({
        type: "postgres",
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        logging: process.env.DATABASE_LOG === "true" ? true : false,
        synchronize: process.env.DATABASE_SYNC === "true" ? true : false,
        entities: [Post, User],

    });


    //const app: express.Express = express();
    const app: express.Express = await express();


    const port: string = await process.env.NODE_PORT;

    //Starting the apollo server with my user and post reslovers
    const apolloServer: ApolloServer = await new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),

        context: ({ req, res }) => ({ req, res }),
    });


    //MiddleWares
    await app.disable('x-powered-by');
    await app.use(rateLimiter(redisClient));
    await app.use(cookieParser());
    await app.use(cors(myUrl()));
    //app.use(csrfProtection());
    await app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));

    //using redis in application and starting a session
    //intialization of cookies as well
    await app.use(lypdCookie);


    await apolloServer.applyMiddleware({ app });

    //app.get('/form', function (req, res) {
    //    // pass the csrfToken to the view
    //    res.send({ csrfToken: req.csrfToken() });
    //});


    //ports
    await app.listen(port, () => {
        console.log(`listening on port : ${port}`);
    });
};

main().catch((err) => console.log(err));
