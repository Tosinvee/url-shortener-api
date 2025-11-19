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
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interface/token.interface';

@Injectable()
export class AuthService {
  constructor(
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

  async login(user: User) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}`,
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  async verifyUserRefreshToken(
    refreshToken: string,
    userId: string,
    role: string,
  ) {
    try {
      const user = await this.userService.getUser({ _id: userId });
      const authenticated = await compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
