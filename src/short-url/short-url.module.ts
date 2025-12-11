import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrl, ShortUrlSchema } from './schema/short-url.schema';
import { ClickEvent, ClickEventSchema } from './schema/click-event.schema';
import { BullModule } from '@nestjs/bullmq';
import { ShortUrlProcessor } from './short-url.processor';
import { environment } from 'src/environments/environment';
import { NotificationModule } from './notification/notification.module';

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
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: environment.queue.CLICK_EVENTS,
    }),
    NotificationModule,
  ],
  providers: [ShortUrlService, ShortUrlProcessor],
  controllers: [ShortUrlController],
})
export class ShortUrlModule {}
