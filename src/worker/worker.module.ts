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
  ],
  providers: [ShortUrlProcessor, ShortUrlService],
})
export class WorkerModule {}
