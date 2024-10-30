import { Controller, Get, Post, Body, Param, Res, Put } from '@nestjs/common';
import { V1UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Response } from 'express'; // Import Response from express
import { CreateUrlRespDto } from './dto/create-url-resp.dto';

@Controller('v1/url')
export class V1UrlController {
  constructor(private readonly urlService: V1UrlService) {}

  @Get(':shortUrl')
  async getUrl(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const longUrl = await this.urlService.getLongUrl(shortUrl);
    if (longUrl) {
      return res.redirect(longUrl);
    } else {
      return res.status(404).send('URL not found');
    }
  }

  @Post()
  async createUrl(
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<CreateUrlRespDto> {
    return this.urlService.createUrl(
      createUrlDto.longUrl,
      createUrlDto.customShortUrl,
    );
  }

  // Only updates expired URLs
  @Put()
  async updateUrl(
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<CreateUrlRespDto> {
    return this.urlService.updateUrl(
      createUrlDto.longUrl,
      createUrlDto.customShortUrl,
    );
  }
}
