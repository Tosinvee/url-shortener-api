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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from './guard/jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  @ApiOperation({ summary: 'User Signup' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
  })
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({
    schema: {
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
        },
        password: {
          example: 'password123',
        },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({ status: 200, description: 'New access token issued' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Delete('logout')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Logout current user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: User, @Req() req) {
    return this.authService.logout(user);
  }
}
