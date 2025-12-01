import { Body, Controller, Post } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';

@Controller('short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Post('api/shorten')
  async shortenUrl(@Body() body: CreateShortUrlDto) {
    const result = await this.shortUrlService.create(
      body.url,
      body.custom_alias,
      body.expiration_date ? new Date(body.expiration_date) : undefined,
      body.password,
    );
    return {
      short_url: `${process.env.BASE_URL}/${result.code}`,
      original_url: result.originalUrl,
      expiresAt: result.expiresAt,
    };
  }
}
