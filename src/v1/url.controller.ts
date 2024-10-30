import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Put,
  Redirect,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { V1UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { CreateUrlRespDto } from './dto/create-url-resp.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('v1/url')
export class V1UrlController {
  constructor(private readonly urlService: V1UrlService) {}

  @Get(':shortUrl')
  @Redirect()
  async getUrl(@Param('shortUrl') shortUrl: string) {
    const longUrl = await this.urlService.getLongUrl(shortUrl);
    if (longUrl) {
      return { url: longUrl };
    } else {
      throw new NotFoundException('URL not found');
    }
  }

  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
