import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { environment } from 'src/environments/environment';
import { ShortUrlProcessor } from './short-url.processor';
import {
  ShortUrl,
  ShortUrlSchema,
} from 'src/short-url/schema/short-url.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrlService } from 'src/short-url/short-url.service';
import {
  ClickEvent,
  ClickEventSchema,
} from 'src/short-url/schema/click-event.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationProcessor } from './notification.processor';
import {
  Notification,
  NotificationSchema,
} from 'src/notification/notification.schema';
import { FirebaseService } from 'src/firebase/firebase.service';
//import { NotificationProcessor } from 'src/notification/notification.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ShortUrl.name,
        schema: ShortUrlSchema,
      },
      {
        name: ClickEvent.name,
        schema: ClickEventSchema,
      },
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
    BullModule.registerQueue({
      name: environment.queues.NOTIFICATION,
    }),
    BullModule.registerQueue({
      name: environment.queues.CLICK_EVENTS,
    }),
    NotificationModule,
  ],
  providers: [
    ShortUrlProcessor,
    ShortUrlService,
    NotificationProcessor,
    FirebaseService,
  ],
  exports: [],
})
export class WorkerModule {}
