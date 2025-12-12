import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShortUrl } from '../short-url/schema/short-url.schema';
import { ShortUrlService } from '../short-url/short-url.service';
import { Logger } from '@nestjs/common';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/notification/notification.service';

const { CLICK_EVENTS } = environment.queues;
@Processor(CLICK_EVENTS)
export class ShortUrlProcessor extends WorkerHost {
  private readonly logger: Logger;
  constructor(
    @InjectModel(ShortUrl.name) private shortUrlModel: Model<ShortUrl>,
    private shortUrlService: ShortUrlService,
    private notificationService: NotificationService,
  ) {
    super();
    this.logger = new Logger(ShortUrlProcessor.name);
  }

  async process(job: any) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'record_click') {
      const { code, meta } = job.data;

      // 1. Get URL
      let result = await this.shortUrlModel
        .findOne({ code })
        .select('_id code createdBy clickCount');

      if (!result) {
        this.logger.warn(`Short URL with code ${code} not found.`);
        return;
      }

      // 2. Increment clickCount here (worker is correct place)
      await this.shortUrlModel.updateOne(
        { code },
        { $inc: { clickCount: 1 }, $set: { lastClickAt: new Date() } },
      );

      // 3. Fetch updated value
      const updated = await this.shortUrlModel
        .findOne({ code })
        .select('_id code createdBy clickCount');

      // 4. Save click event
      await this.shortUrlService.recordClickInDb(
        updated._id as Types.ObjectId,
        meta,
      );

      this.logger.log(`Recorded click for Short URL with code ${code}.`);

      // 5. Trigger notification based on NEW clickCount
      if (updated.clickCount === 11 && updated.createdBy) {
        await this.notificationService.sendNotification(
          updated.createdBy,
          `🎉 Your link reached ${updated.clickCount} clicks!`,
          `Your short link (${updated.code}) has now hit ${updated.clickCount} clicks.`,
        );
      }

      return; // 🔥 important
    }

    this.logger.warn(`Unknown job type: ${job.name}`);

    this.logger.warn(`Unknown job type: ${job.name}`);
  }
}
