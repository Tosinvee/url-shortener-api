import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import { ShortUrl } from './schema/short-url.schema';
import * as bcrypt from 'bcryptjs';
import { randomBase62 } from 'src/utils/cutomAlias';

const redis = new Redis(process.env.REDIS_URL);
@Injectable()
export class ShortUrlService {
  constructor(
    @InjectModel(ShortUrl.name) private shortUrlModel: Model<ShortUrl>,
  ) {}

  private CODE_LENGTH = 6;

  async create(
    originalUrl: string,
    customAlias: string,
    expiresAt?: Date,
    password?: string,
    createdBy?: string,
  ) {
    if (customAlias) {
      const existedCustomAlias = await this.shortUrlModel.findOne({
        code: customAlias,
      });
      if (existedCustomAlias)
        throw new BadRequestException('Alias already taken');

      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;

      const result = new this.shortUrlModel({
        code: customAlias,
        originalUrl,
        expiresAt,
        passwordHash: hashedPassword,
        createdBy,
      });
      await result.save();
      await redis.set(
        `short:${result.code}`,
        result.originalUrl,
        'EX',
        86400 * 7,
      );
      return result;
    }
    for (let i = 0; i < 6; i++) {
      const code = randomBase62(this.CODE_LENGTH);
      const existedCustomAlias = await this.shortUrlModel.findOne({
        code: customAlias,
      });
      if (existedCustomAlias)
        throw new BadRequestException('Alias already taken');

      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;

      const result = new this.shortUrlModel({
        code: customAlias,
        originalUrl,
        expiresAt,
        passwordHash: hashedPassword,
        createdBy,
      });
      await result.save();
      await redis.set(
        `short:${result.code}`,
        result.originalUrl,
        'EX',
        86400 * 7,
      );
      return result;
    }
    throw new Error('failed to generate unquie code');
  }
}
