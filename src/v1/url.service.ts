import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { V1Url } from './db/url.entity';
import { generate } from 'short-uuid';
import { CreateUrlRespDto } from './dto/create-url-resp.dto';

@Injectable()
export class V1UrlService {
  constructor(
    @InjectRepository(V1Url)
    private readonly urlRepository: Repository<V1Url>,
  ) {}

  async getLongUrl(shortUrl: string): Promise<string> {
    // Sanitize the short URL against SQL Injection attacks
    if (
      shortUrl.includes(';') ||
      shortUrl.includes('--') ||
      shortUrl.length > 16 ||
      shortUrl.includes("'")
    ) {
      throw new BadRequestException(
        'Invalid values. Please enter valid values',
      );
    }

    // 1. Search the database for the long URL using the short URL.
    const url = await this.urlRepository.findOne({
      where: { shortUrl },
    });

    // 2. If the short URL exists, return the long URL.
    // Do a check on expiration
    if (url && url.expiresAt < new Date()) {
      throw new HttpException(
        'URL has expired. PUT a request for a new shortUrl.',
        410,
      );
    } else if (url) {
      return url.longUrl;
    } else {
      return null;
    }
  }

  async createUrl(
    longUrl: string,
    customShortUrl?: string,
  ): Promise<CreateUrlRespDto> {
    // Sanitize the long URL and custom short URL against SQL Injection attacks
    if (
      longUrl.includes(';') ||
      longUrl.includes('--') ||
      longUrl.includes("'") ||
      customShortUrl?.includes(';') ||
      customShortUrl?.includes('--') ||
      customShortUrl?.includes("'")
    ) {
      throw new BadRequestException(
        'Invalid values. Please enter valid values',
      );
    }

    // Validate the long URL to ensure it is a valid URL
    try {
      new URL(longUrl);
    } catch (error) {
      throw new BadRequestException('Invalid URL');
    }

    // 1. Search if the long URL already exists in the database.
    const existingUrl = await this.urlRepository.findOne({
      where: { longUrl },
    });

    // 2. If the long URL exists, return the short URL.
    if (existingUrl) {
      return {
        longUrl,
        shortUrl: existingUrl.shortUrl,
        expiresAt: existingUrl.expiresAt,
      };
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

    // 6. Save the long URL and short URL to the database. With the current time, and expiration in 5 years
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 5);

    try {
      await this.urlRepository.insert({
        longUrl,
        shortUrl,
        createdAt,
        expiresAt,
      });
      return { longUrl, shortUrl, expiresAt };
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
