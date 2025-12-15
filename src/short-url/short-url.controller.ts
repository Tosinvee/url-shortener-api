import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ShortUrlService } from './short-url.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('ShortUrl')
@ApiBearerAuth()
@Controller('short-url')
@UseGuards(JwtGuard)
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Post('api/shorten')
  @ApiOperation({ summary: 'Create a short URL' })
  @ApiResponse({
    status: 201,
    description: 'Short URL created successfully',
    schema: {
      example: {
        short_url: 'https://sho.rt/abc123',
        original_url: 'https://example.com',
        expiresAt: '2025-12-31T23:59:59.000Z',
      },
    },
  })
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
  @ApiOperation({ summary: 'Get analytics for a short URL' })
  @ApiParam({
    name: 'code',
    example: 'abc123',
    description: 'Short URL code',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data',
  })
  async getAnalytics(@Param('code') code: string) {
    const analytics = await this.shortUrlService.getAnalytics(code);
    return analytics;
  }

  @Get(':code')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({
    name: 'code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the original URL',
  })
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

  @Delete(':code')
  @ApiOperation({ summary: 'Delete a short URL' })
  @ApiParam({
    name: 'code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Short URL deleted successfully',
    schema: {
      example: {
        message: 'Short URL deleted successfully',
      },
    },
  })
  async deleteShortUrl(@Param('code') code: string) {
    await this.shortUrlService.delete(code);
    return { message: 'Short URL deleted successfully' };
  }
}
