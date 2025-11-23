import { config } from 'dotenv';

config();

const { env } = process;
export const environment = {
  port: env.PORT || 3000,
  mongoURI: env.DATABASE_URL,
  jwtAccessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
  jwtRefreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
  jwtAccessTokenExpiration: env.JWT_ACCESS_TOKEN_EXPIRATION,
  jwtRefreshTokenExpiration: env.JWT_REFRESH_TOKEN_EXPIRATION,
};
