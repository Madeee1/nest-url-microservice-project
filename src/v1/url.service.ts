import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { V1Url } from './db/url.entity';
import { generate } from 'short-uuid';

@Injectable()
export class V1UrlService {
  constructor(
    @InjectRepository(V1Url)
    private readonly urlRepository: Repository<V1Url>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createUrl(
    longUrl: string,
    customShortUrl?: string,
  ): Promise<{ longUrl: string; shortUrl: string }> {
    // 1. Search if the long URL already exists in the database.
    const existingUrl = await this.urlRepository.findOne({
      where: { longUrl },
    });

    // 2. If the long URL exists, return the short URL.
    if (existingUrl) {
      return { longUrl, shortUrl: existingUrl.shortUrl };
    }

    let shortUrl: string;

    // 3. If there is a custom short URL, check if it already exists in the database
    if (customShortUrl) {
      if (customShortUrl.length > 16) {
        throw new BadRequestException(
          'Custom short URL must be a maximum of 16 characters',
        );
      }

      const existingCustomUrl = await this.urlRepository.findOne({
        where: { shortUrl: customShortUrl },
      });

      // 4. If the custom short URL exists, return an error message.
      if (existingCustomUrl) {
        throw new BadRequestException('Custom short URL already exists');
      }

      shortUrl = customShortUrl;
    } else {
      // 5. If the custom short URL does not exist, create a new short URL.
      shortUrl = await this.generateUniqueShortUrl();
    }

    try {
      // 6. Save the long URL and short URL to the database.
      await this.urlRepository.insert({ longUrl, shortUrl });
      return { longUrl, shortUrl };
    } catch (error) {
      // Catch unexpected errors
      throw new Error(`Failed to create URL: ${error.message}`);
    }
  }

  private async generateUniqueShortUrl(): Promise<string> {
    let uniqueShortUrl: string;
    let isUnique = false;

    while (!isUnique) {
      uniqueShortUrl = generate().substring(0, 6);
      const existingUrl = await this.urlRepository.findOne({
        where: { shortUrl: uniqueShortUrl },
      });

      if (!existingUrl) {
        isUnique = true;
      }
    }

    return uniqueShortUrl;
  }
}
