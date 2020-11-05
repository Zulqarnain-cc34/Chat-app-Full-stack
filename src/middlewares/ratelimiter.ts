import rateLimit from 'express-rate-limit';
import RateLimiterStore from "rate-limit-redis";
import redis from 'redis';

export const rateLimiter = (redisClient: redis.RedisClient
) => {
    return new rateLimit({
        store: new RateLimiterStore({ client: redisClient }),
        windowMs: 60 * 60 * 1000,
        max: 100,
        delayMs: 0,
        message: "you have made a lot of requests you cannot excedd the limit"
    });
}
