import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { V1Url } from './db/url.entity';

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
    try {
      // 1. Search if the long URL already exists in the database.
      const existingUrl = await this.urlRepository.findOne({
        where: { longUrl },
      });

      // 2. If the long URL exists, return the short URL.
      if (existingUrl) {
        return { longUrl, shortUrl: existingUrl.shortUrl };
      }

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

        // Create the data point in the database
        await this.urlRepository.insert({ longUrl, shortUrl: customShortUrl });
        return { longUrl, shortUrl: customShortUrl };
      } else {
        // 5. If the custom short URL does not exist, create a new short URL.
        const uniqueShortUrl = 'testing';
        await this.urlRepository.insert({ longUrl, shortUrl: uniqueShortUrl });

        // 6. Return the long URL and the short URL.
        return { longUrl, shortUrl: uniqueShortUrl };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
