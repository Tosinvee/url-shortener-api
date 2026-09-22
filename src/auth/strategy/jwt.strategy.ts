import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from '../interface/token.interface';
import { Types } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (req, rawJwtToken, done) => {
        try {
          const decoded = this.authService.decodeToken(rawJwtToken);
          if (!decoded || !decoded.userId) {
            return done(new UnauthorizedException('Invalid Token'), null);
          }
          const user = await this.userService.getUser({ _id: decoded.userId });
          if (!user) {
            return done(new UnauthorizedException('User not found'), null);
          }
          done(null, this.authService.getAccessTokenSecret(user));
        } catch (error) {
          done(error, null);
        }
      },
    });
  }

  async validate(payload: TokenPayload) {
    if (!payload?.userId || !Types.ObjectId.isValid(payload.userId)) {
      throw new UnauthorizedException('Invalid Token');
    }
    const user = await this.userService.getUser({
      _id: new Types.ObjectId(payload.userId),
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
