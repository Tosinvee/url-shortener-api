import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/decorator/current-user';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { use } from 'passport';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUser(@CurrentUser() user: User, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(user.id, body);
  }
  @Get()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  // @Post('register-fcm-token')
  // @UseGuards(JwtGuard)
  // @ApiOperation({ summary: 'Subscribe user to FCM topic' })
  // @ApiResponse({ status: 200, description: 'Subscribed to topic successfully' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @Patch('subscribe-topic')
  // async subscribeToTopic(
  //   @CurrentUser() user: User,
  //   @Body('token') token: string,
  // ) {
  //   await this.userService.subscribeUserToTopic(user.id, token);
  //   return { message: 'Subscribed to topic successfully' };
  // }
}
