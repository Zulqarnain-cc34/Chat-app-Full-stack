import session from "express-session";
import { COOKIE_NAME, __prod__ } from "../constants";
import { redis, RedisStore } from "../redis/redis";

export const lypdCookie = session({
    name: COOKIE_NAME,
    store: new RedisStore({ client: redis, disableTouch: true }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, //1 years
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: !__prod__, //only works in https
    },
    saveUninitialized: false,
    secret: "sdafosfoasjkflsdjfafa90eolsd",
    resave: false,
});
