import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model, Types } from 'mongoose';
import { ShortUrl } from './schema/short-url.schema';
import * as bcrypt from 'bcryptjs';
import { randomBase62 } from 'src/utils/cutomAlias';
import { ClickEvent } from './schema/click-event.schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { environment } from 'src/environments/environment';

const { CLICK_EVENTS } = environment.queue;

const redis = new Redis(process.env.REDIS_URL);
@Injectable()
export class ShortUrlService {
  constructor(
    @InjectModel(ShortUrl.name) private shortUrlModel: Model<ShortUrl>,
    @InjectModel(ClickEvent.name) private clickEventModel: Model<ClickEvent>,
    @InjectQueue(CLICK_EVENTS) private clickQueue: Queue,
  ) {}

  private CODE_LENGTH = 6;
  private MAX_GENERATE_ATTEMPTS = 6;

  async create(
    originalUrl: string,
    customAlias?: string,
    expiresAt?: Date,
    password?: string,
    createdBy?: string,
  ) {
    let code: string;

    if (customAlias) {
      const exists = await this.shortUrlModel.findOne({ code: customAlias });
      if (exists) throw new BadRequestException('Alias already taken');
      code = customAlias;
    } else {
      for (let i = 0; i < this.MAX_GENERATE_ATTEMPTS; i++) {
        code = randomBase62(this.CODE_LENGTH);
        const exists = await this.shortUrlModel.findOne({ code });
        if (!exists) break;
        if (i === this.MAX_GENERATE_ATTEMPTS - 1)
          throw new Error('Failed to generate unique code');
      }
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const result = new this.shortUrlModel({
      code,
      originalUrl,
      expiresAt,
      passwordHash: hashedPassword,
      createdBy,
    });

    await result.save();

    await redis.set(`short:${code}`, originalUrl, 'EX', 86400 * 7);

    return result;
  }

  async findAlias(code: string) {
    const cached = await redis.get(`short:${code}`);
    if (cached) return cached;

    const result = await this.shortUrlModel.findOne({ code, isDeleted: false });
    if (!result) throw new NotFoundException('Not found');
    if (result.expiresAt && result.expiresAt < new Date())
      throw new NotFoundException('Expired');

    await redis.set(`short:${code}`, result.originalUrl, 'EX', 86400);

    return result.originalUrl;
  }

  async enqueueClick(
    code: string,
    meta: {
      ip?: string;
      userAgent?: string;
      referer?: string;
      country?: string;
    },
  ) {
    await this.shortUrlModel.updateOne(
      { code },
      { $inc: { clickCount: 1 }, $set: { lastClickAt: new Date() } },
    );

    await this.clickQueue.add(
      'record_click',
      { code, meta },
      { removeOnComplete: true },
    );
  }

  async recordClickInDb(shortUrlId: Types.ObjectId, meta: any) {
    const event = new this.clickEventModel({
      shortUrlId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      referer: meta.referer,
      country: meta.country,
    });

    await event.save();
  }
}
