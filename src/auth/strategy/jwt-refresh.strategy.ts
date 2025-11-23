import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { TokenPayload } from '../interface/token.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (req, rawToken, done) => {
        try {
          const decoded: any = JSON.parse(
            Buffer.from(rawToken.split('.')[1], 'base64').toString(),
          );
          const user = await this.userModel.findById(decoded.userId);
          if (!user) return done(new Error('User not found'), null);

          const secert =
            user.sessionKey +
            configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET');
          return done(null, secert);
        } catch (err) {
          return done(err, null);
        }
      },
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const refreshToken = request.headers['authorization']?.split(' ')[1];

    if (!refreshToken) throw new UnauthorizedException('Missing token');

    return { payload, refreshToken };
  }
}
