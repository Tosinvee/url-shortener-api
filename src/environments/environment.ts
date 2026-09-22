import { config } from 'dotenv';

config();

const { env } = process;
export const environment = {
  port: env.PORT || 3000,
  mongoURI: env.DATABASE_URL,
  jwtAccessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
  jwtRefreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
  jwtAccessTokenExpiration: Number(env.JWT_ACCESS_TOKEN_EXPIRATION) || 36000,
  jwtRefreshTokenExpiration: env.JWT_REFRESH_TOKEN_EXPIRATION_MS
    ? Math.floor(Number(env.JWT_REFRESH_TOKEN_EXPIRATION_MS) / 1000)
    : Number(env.JWT_REFRESH_TOKEN_EXPIRATION) || 604800,

  redis: {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT) || 6379,
  },

  queues: {
    CLICK_EVENTS: 'click-events',
    NOTIFICATION: 'notification',
  },
};
