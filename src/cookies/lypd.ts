import session from "express-session";
import { __prod__ } from "../constants";
import { redisClient, RedisStore } from "../redis/redis";


export const lypdCookie = session({
    name: "lypd",
    store: new RedisStore({ client: redisClient, disableTouch: true }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365,        //1 years
        httpOnly: true,
        sameSite: "lax",                          //csrf
        secure: !__prod__,                        //only works in https
    },
    saveUninitialized: false,
    secret: "sdafosfoasjkflsdjfafa90eolsd",
    resave: false,
})