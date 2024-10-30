import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  HttpStatus,
  GoneException,
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

  /**
   * Retrieves the long URL associated with a given short URL.
   * @param shortUrl The short URL identifier.
   * @returns The corresponding long URL.
   */
  async getLongUrl(shortUrl: string): Promise<string> {
    this.sanitizeUrl(shortUrl);

    const url = await this.urlRepository.findOne({
      where: { shortUrl },
    });

    if (!url) {
      return null;
    }

    // Check for expiration
    if (url.expiresAt < new Date()) {
      throw new GoneException('Short URL has expired. Update it with a PUT request.');
    }

    return url.longUrl;
  }

  /**
   * Creates a new short URL for a given long URL.
   * @param longUrl required original url
   * @param customShortUrl optional
   * @returns
   */
  async createUrl(
    longUrl: string,
    customShortUrl?: string,
  ): Promise<CreateUrlRespDto> {
    // 1. Sanitize URLs
    this.sanitizeUrl(longUrl, customShortUrl);

    // 2. Validate the long URL
    this.validateUrlFormat(longUrl);

    // 3. Check if the long URL already exists
    const existingUrl = await this.urlRepository.findOne({
      where: { longUrl },
    });

    if (existingUrl) {
      return {
        longUrl: existingUrl.longUrl,
        shortUrl: existingUrl.shortUrl,
        expiresAt: existingUrl.expiresAt,
      };
    }

    // 4. Handle custom short URL or generate a unique one
    const shortUrl = customShortUrl
      ? await this.handleCustomShortUrl(customShortUrl)
      : await this.generateUniqueShortUrl();

    // 5. Calculate creation and expiration dates
    const createdAt = new Date();
    const expiresAt = this.calculateNewExpirationDate();

    // 6. Save the new URL to the database
    try {
      await this.urlRepository.insert({
        longUrl,
        shortUrl,
        createdAt,
        expiresAt,
      });
      return { longUrl, shortUrl, expiresAt };
    } catch (error) {
      // Log the error as needed
      throw new HttpException(
        `Failed to create URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    this.validateUrlFormat(longUrl);

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
   * Sanitizes a URL or 2 URLs sagainst SQL Injection attacks.
   * @param url1 The first URL to sanitize. (required)
   * @param url2 (optional)
   */
  private sanitizeUrl(url1: string, url2?: string): void {
    if (
      V1UrlService.SANITIZATION_REGEX.test(url1) ||
      (url2 && V1UrlService.SANITIZATION_REGEX.test(url2))
    ) {
      throw new BadRequestException('Invalid characters detected in URL.');
    }
  }

  /**
   * Validates the format of the long URL.
   * @param longUrl The original long URL.
   */
  private validateUrlFormat(longUrl: string): void {
    try {
      new URL(longUrl);
    } catch {
      throw new BadRequestException('Invalid URL format.');
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
