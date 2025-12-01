import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';
import { environment } from 'src/environments/environment';
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
        const decoded = this.authService.decodeToken(rawJwtToken);
        const user = await this.userService.getUser({ _id: decoded.userId });
        const secret = this.authService.getAccessTokenSecret(user);
        done(null, secret);
      },
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getUser({
      _id: new Types.ObjectId(payload.userId),
    });
    return user;
  }
}
