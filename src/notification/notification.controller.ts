import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/auth/decorator/current-user';
import { User } from 'src/user/schema/user.schema';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(@CurrentUser() user: User) {
    return this.notificationService.getNotifications(user._id.toString());
  }

  @Get(':id')
  async getNotification(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notificationService.getNotification(id, user._id.toString());
  }

  @Patch(':id')
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateNotificationDto,
  ) {
    return this.notificationService.markAsRead(id, body);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notificationService.delete(user._id.toString());
  }
}
