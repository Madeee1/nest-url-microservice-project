import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { V1Url } from './db/url.entity';
import { generate } from 'short-uuid';
import { CreateUrlRespDto } from './dto/create-url-resp.dto';

@Injectable()
export class V1UrlService {
  private static readonly MAX_CUSTOM_SHORT_URL_LENGTH = 16;
  private static readonly EXPIRATION_YEARS = 5;
  private static readonly SANITIZATION_REGEX = /[;'--]/;

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

  /**
   * Updates an expired URL with a new short URL and expiration date.
   * @param longUrl The long URL to update
   * @param customShortUrl The custom short URL to update
   * @returns The updated URL response
   */
  async updateUrl(
    longUrl: string,
    customShortUrl?: string,
  ): Promise<CreateUrlRespDto> {
    // 1. Sanitization
    this.sanitizeUrl(longUrl, customShortUrl);

    // 2. Validate the long URL
    try {
      new URL(longUrl);
    } catch {
      throw new BadRequestException('Invalid URL format.');
    }

    // 3. Retrieve existing URL from repository
    const existingUrl = await this.urlRepository.findOne({
      where: { longUrl },
    });

    if (!existingUrl) {
      throw new NotFoundException('URL not found.');
    }

    if (existingUrl.expiresAt >= new Date()) {
      // URL exists and is not expired
      return {
        longUrl,
        shortUrl: existingUrl.shortUrl,
        expiresAt: existingUrl.expiresAt,
      };
    }

    // 4. Handle expired URL
    const shortUrl = customShortUrl
      ? await this.handleCustomShortUrl(customShortUrl)
      : await this.generateUniqueShortUrl();

    const newExpiresAt = this.calculateNewExpirationDate();

    // 5. Update the repository with new shortUrl and expiresAt
    await this.urlRepository.update(
      { longUrl },
      { shortUrl, expiresAt: newExpiresAt },
    );

    return { longUrl, shortUrl, expiresAt: newExpiresAt };
  }

  /**
   * Generates a unique short URL.
   * @returns A unique short URL string.
   */
  private async generateUniqueShortUrl(): Promise<string> {
    let uniqueShortUrl: string;

    do {
      uniqueShortUrl = generate().substring(0, 6);
      const existingUrl = await this.urlRepository.findOne({
        where: { shortUrl: uniqueShortUrl },
      });
      if (!existingUrl) {
        break;
      }
    } while (true);

    return uniqueShortUrl;
  }

  /**
   * Sanitizes the long URL and custom short URL against SQL Injection attacks.
   * @param longUrl The original long URL.
   * @param customShortUrl The user-provided custom short URL (optional).
   */
  private sanitizeUrl(longUrl: string, customShortUrl?: string): void {
    if (
      V1UrlService.SANITIZATION_REGEX.test(longUrl) ||
      (customShortUrl && V1UrlService.SANITIZATION_REGEX.test(customShortUrl))
    ) {
      throw new BadRequestException('Invalid characters detected in URL.');
    }
  }

  /**
   * Handles  creation and validation of a custom short URL.
   * @param customShortUrl The custom short URL provided by the user.
   * @returns The validated custom short URL.
   */
  private async handleCustomShortUrl(customShortUrl: string): Promise<string> {
    if (customShortUrl.length > V1UrlService.MAX_CUSTOM_SHORT_URL_LENGTH) {
      throw new BadRequestException(
        `Custom short URL must be at most ${V1UrlService.MAX_CUSTOM_SHORT_URL_LENGTH} characters.`,
      );
    }

    const existingCustomUrl = await this.urlRepository.findOne({
      where: { shortUrl: customShortUrl },
    });

    if (existingCustomUrl) {
      throw new BadRequestException('Custom short URL already exists.');
    }

    return customShortUrl;
  }

  /**
   * Calculates the new expiration date.
   * @returns A Date object set to the new expiration date.
   */
  private calculateNewExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setFullYear(
      expiresAt.getFullYear() + V1UrlService.EXPIRATION_YEARS,
    );
    return expiresAt;
  }
}
