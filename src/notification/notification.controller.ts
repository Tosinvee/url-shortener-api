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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getNotifications(@CurrentUser() user: User) {
    return this.notificationService.getNotifications(user._id.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single notification by ID' })
  @ApiParam({
    name: 'id',
    example: '64f8c123abc...',
    description: 'Notification ID',
  })
  @ApiResponse({ status: 200, description: 'Notification object' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotification(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notificationService.getNotification(id, user._id.toString());
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({
    name: 'id',
    example: '64f8c123abc...',
    description: 'Notification ID',
  })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
  })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateNotificationDto,
  ) {
    return this.notificationService.markAsRead(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({
    name: 'id',
    example: '64f8c123abc...',
    description: 'Notification ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notificationService.delete(user._id.toString());
  }
}
