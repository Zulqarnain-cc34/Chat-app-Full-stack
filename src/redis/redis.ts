import connectRedis from 'connect-redis';
import session from 'express-session';
import redis from "redis";

//Redis Connection initialization and setup of configuration
//intialization of connection,creating redis client and setting up of store
//port of the redis server not necessary

const redisPort = 6379;
export const RedisStore = connectRedis(session);
export const redisClient = redis.createClient(redisPort);