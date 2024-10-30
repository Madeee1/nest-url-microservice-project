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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('v1/url')
export class V1UrlController {
  constructor(private readonly urlService: V1UrlService) {}

  @ApiOperation({ summary: 'Get long URL from short URL' })
  @ApiResponse({ status: 302, description: 'Redirect to long URL' })
  @ApiResponse({ status: 404, description: 'URL not found' })
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

  @ApiOperation({ summary: 'Create a new URL' })
  @ApiResponse({ status: 201, description: 'URL created successfully' })
  @ApiResponse({ status: 409, description: 'URL already exists' })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Update an existing URL' })
  @ApiResponse({ status: 200, description: 'URL updated successfully' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
