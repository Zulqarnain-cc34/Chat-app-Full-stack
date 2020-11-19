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
//import { csrfProtection } from "./middlewares/csrf";
import helmet from "helmet";
import dotenv from 'dotenv';
import _ from "./../environment";
import http from "http";
import { myUrl } from "./middlewares/cors";


const main = async () => {
    await dotenv.config();


    await createConnection({
        type: (process.env.DATABASE_TYPE.type === "postgres") ? 'postgres' : 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        logging: process.env.DATABASE_LOG === "true" ? true : false,
        synchronize: process.env.DATABASE_SYNC === "true" ? true : false,
        entities: [Post, User],

    });

    const app: express.Express = await express();

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


    //http server
    const httpServer = await http.createServer(app);

    const port: string = await process.env.NODE_PORT;

    //Starting the apollo server with my user and post reslovers
    const apolloServer: ApolloServer = await new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver],
            validate: false,
        }),
        subscriptions: {
            path: "/subscriptions",
        },
        context: ({ req, res }) => ({ req, res }),
    });
    await apolloServer.applyMiddleware({ app });
    await apolloServer.installSubscriptionHandlers(httpServer);





    //app.get('/form', function (req, res) {
    //    // pass the csrfToken to the view
    //    res.send({ csrfToken: req.csrfToken() });
    //});

    await httpServer.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`)
        console.log(`🚀 Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`)
    })


};

main().catch((err) => console.log(err));
