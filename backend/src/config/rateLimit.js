import RateLimitRedis from 'rate-limit-redis';
import Redis from 'ioredis';

export default {
  store: new RateLimitRedis({
    client: new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
  }),
  windowMs: 1000 * 60 * 15,
  max: 100,
};
