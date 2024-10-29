import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';

@Injectable()
export class V1UrlService {
  getHello(): string {
    return 'Hello World!';
  }

  async createUrl(longUrl: string, customShortUrl?: string): Promise<string> {
    // Logic for URL here

    if (!customShortUrl) {
      customShortUrl = Math.random().toString(36).substring(2, 7);
    }

    // for testing, return the long URL and custom short URL
    return `Long URL: ${longUrl}, Custom Short URL: ${customShortUrl}`;
  }
}
