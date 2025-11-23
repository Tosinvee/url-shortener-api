import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignupDto } from './dto/singup.dto';
import { compare } from 'bcryptjs';
import { User } from 'src/user/schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenPayload } from './interface/token.interface';
import { session } from 'passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async signup(body: SignupDto) {
    const existigUser = await this.userService.getUser({ email: body.email });
    if (existigUser) {
      throw new BadRequestException('User already exists');
    }
    await this.userService.create(body);
    return { message: 'User created' };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({
        email,
      });
      if (!user) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException(err, 'Credentials are not valid.');
    }
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token) as TokenPayload;
  }

  getTokenOptions(type: 'access' | 'refresh', user: User) {
    const secret = environment[type + 'TokenSecret'] + user.sessionKey;
    const options: JwtSignOptions = { secret };

    const expiration = environment[type + 'TokenExpiration'];
    if (expiration) options.expiresIn = expiration;
    return options;
  }

  getAccessTokenSecret(user: User) {
    return environment.jwtAccessTokenSecret + user.sessionKey;
  }

  async login(user: User) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(
      tokenPayload,
      this.getTokenOptions('access', user),
    );
    const refresh_token = await this.jwtService.signAsync(
      tokenPayload,
      this.getTokenOptions('refresh', user),
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(refreshToken: string) {
    const decodedToken = this.jwtService.decode(refreshToken) as TokenPayload;
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Token');
    }
    const user = await this.userService.getUser({ _id: decodedToken.userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const secret = environment.jwtRefreshTokenSecret + user.sessionKey;

    await this.jwtService.verifyAsync(refreshToken, { secret });
    return this.login(user);
  }

  async logout(user: User) {
    user.sessionKey = this.userService.generateSessionToken();
    await this.userModel.updateOne(
      { _id: user._id },
      { sessionKey: user.sessionKey },
    );
    return { message: 'Logged out successfully' };
  }
}
