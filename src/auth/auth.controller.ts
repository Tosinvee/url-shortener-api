import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/singup.dto';
import { LocalGuard } from './guard/local.guard';
import { RefreshGuard } from './guard/refresh.guard';
import { CurrentUser } from './decorator/current-user';
import { User } from 'src/user/schema/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('refresh-token')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Delete('logout')
  async logout(@CurrentUser() user: User, @Req() req) {
    return this.authService.logout(user);
  }
}
