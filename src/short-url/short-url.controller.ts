import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
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

  @Get('/api/analytics/:code')
  async getAnalytics(@Param('code') code: string) {
    const analytics = await this.shortUrlService.getAnalytics(code);
    return analytics;
  }

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const redirectResult = await this.shortUrlService.findAlias(code);

    this.shortUrlService
      .enqueueClick(code, {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
        referer: req.headers['referer'] || '',
      })
      .catch((err) => console.error('Failed to enqueue click event', err));
    return res.redirect(HttpStatus.FOUND, redirectResult);
  }
}
