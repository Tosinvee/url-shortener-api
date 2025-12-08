import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShortUrl } from './schema/short-url.schema';
import { ShortUrlService } from './short-url.service';
import { Logger } from '@nestjs/common';
import { environment } from 'src/environments/environment';

const { CLICK_EVENTS } = environment.queue;
@Processor(CLICK_EVENTS)
export class ShortUrlProcessor extends WorkerHost {
  private readonly logger: Logger;
  constructor(
    @InjectModel(ShortUrl.name) private shortUrlModel: Model<ShortUrl>,
    private shortUrlService: ShortUrlService,
  ) {
    super();
    this.logger = new Logger(ShortUrlProcessor.name);
  }

  async process(job: any) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'record_click') {
      const { code, meta } = job.data;

      const result = await this.shortUrlModel.findOne({ code }).select('_id');
      if (!result) {
        this.logger.warn(`Short URL with code ${code} not found.`);
        return;
      }
      await this.shortUrlService.recordClickInDb(
        result._id as Types.ObjectId,
        meta,
      );
      this.logger.log(`Recorded click for Short URL with code ${code}.`);
      return;
    }
    this.logger.warn(`Unknown job type: ${job.name}`);
  }
}
