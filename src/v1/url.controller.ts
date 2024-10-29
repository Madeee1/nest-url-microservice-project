import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { V1UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Response } from 'express'; // Import Response from express

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
  ): Promise<{ longUrl: string; shortUrl: string }> {
    return this.urlService.createUrl(
      createUrlDto.longUrl,
      createUrlDto.customShortUrl,
    );
  }
}
