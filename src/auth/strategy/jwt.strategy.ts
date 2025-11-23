import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from '../interface/token.interface';
import { AuthService } from '../auth.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const decodedToken = authService.decodeToken(rawJwtToken);
          if (!decodedToken) throw new UnauthorizedException('Invalid Token');

          const user = await userService.getUser({ _id: decodedToken.userId });
          if (!user) throw new UnauthorizedException('User not found');

          const secret = authService.getAccessTokenSecret(user);
          done(null, secret);
        } catch (err) {
          done(err, null);
        }
      },
    });
  }

  async validate(payload: TokenPayload) {
    return this.userService.getUser({
      _id: payload.userId,
      email: payload.email,
    });
  }
}
