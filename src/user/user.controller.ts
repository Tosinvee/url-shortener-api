import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/decorator/current-user';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch()
  @UseGuards(JwtGuard)
  async updateUser(@CurrentUser() user: User, body: UpdateUserDto) {
    return this.userService.updateUser(user.id, body);
  }
  @Get()
  @UseGuards(JwtGuard)
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
