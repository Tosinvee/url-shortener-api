import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrl, ShortUrlSchema } from './schema/short-url.schema';
import { ClickEvent, ClickEventSchema } from './schema/click-event.schema';
import { BullModule } from '@nestjs/bullmq';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';

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
    ]),
    BullModule.registerQueue({
      name: environment.queues.CLICK_EVENTS,
    }),
    NotificationModule,
  ],
  providers: [ShortUrlService],
  controllers: [ShortUrlController],
})
export class ShortUrlModule {}
