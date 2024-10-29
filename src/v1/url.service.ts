import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';

@Injectable()
export class V1UrlService {
  getHello(): string {
    return 'Hello World!';
  }

  async createUrl(
    longUrl: string,
    customShortUrl?: string,
  ): Promise<{ longUrl: string; shortUrl: string }> {
    // Logic for this function:
    // 1. Search if the long URL already exists in the database.
    // 2. If the long URL exists, return the short URL.
    // 3. If there is a custom short URL, check if it already exists in the database
    // 4. If the custom short URL exists, return an error message.
    // 5. If the custom short URL does not exist, create a new short URL.
    // 6. If there is no custom short URL, create a new short URL.
    // 7. Return the long URL and short URL.

    if (customShortUrl) {
      if (customShortUrl.length > 16) {
        throw new BadRequestException(
          'Custom short URL must be a maximum of 16 characters',
        );
      }
    }

    customShortUrl = Math.random().toString(36).substring(2, 7);

    // for testing, return the long URL and custom short URL
    return { longUrl, shortUrl: customShortUrl };
  }
}
