import { Controller, Get, Post, Body } from '@nestjs/common';
import { V1UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller('v1/url')
export class V1UrlController {
  constructor(private readonly urlService: V1UrlService) {}

  @Get()
  getHello(): string {
    return this.urlService.getHello();
  }

  @Post()
  async createUrl(@Body() createUrlDto: CreateUrlDto): Promise<string> {
    return this.urlService.createUrl(
      createUrlDto.longUrl,
      createUrlDto.customShortUrl,
    );
  }
}
