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
import { csrfProtection } from "./middlewares/csrf";
import helmet from "helmet";



const main = async () => {

    await createConnection({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "g4l4ct1c",
        database: "lireddit2",
        logging: true,
        synchronize: true,
        entities: [Post, User],
    });


    const app = express();


    const port = process.env.NODE_PORT || 4000;

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),

        context: ({ req, res }) => ({ req, res }),
    });


    //MiddleWares
    app.disable('x-powered-by');
    app.use(rateLimiter(redisClient));
    app.use(cookieParser());
    app.use(cors(myUrl()));
    app.use(csrfProtection());
    app.use(helmet());

    //using redis in application and starting a session
    //intialization of cookies as well
    app.use(lypdCookie);


    apolloServer.applyMiddleware({ app });

    app.get('/form', function (req, res) {
        // pass the csrfToken to the view
        res.send({ csrfToken: req.csrfToken() });
    });


    //ports
    app.listen(port, () => {
        console.log(`listening on port : ${port}`);
    });
};

main().catch((err) => console.log(err));
