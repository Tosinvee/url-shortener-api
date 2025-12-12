import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './notification.schema';
import { Model } from 'mongoose';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { environment } from 'src/environments/environment';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
const { NOTIFICATION } = environment.queues;
@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectQueue(NOTIFICATION) private notificationQueue: Queue,
  ) {}

  async sendNotification(userId: string, title: string, message: string) {
    await this.notificationQueue.add(
      'send_notification',
      {
        userId,
        createNotificationDto: { title, content: message },
      },
      { removeOnComplete: true },
    );
  }

  async getNotifications(userId: string) {
    return this.notificationModel.countDocuments({ userId });
  }

  async getNotification(id: string, userId: string) {
    return this.notificationModel.findById(id);
  }

  async markAsRead(id: string, body: UpdateNotificationDto) {
    const result = await this.notificationModel.findByIdAndUpdate(id, body, {
      new: true,
    });
  }

  async delete(userId: string) {
    await this.notificationModel.deleteMany({ userId });
    return { message: 'Notifications deleted successfully' };
  }
}
