import { Test, TestingModule } from '@nestjs/testing';
import { V1UrlController } from './url.controller';
import { V1UrlService } from './url.service';
import { V1Url } from './db/url.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AppController', () => {
  let v1UrlController: V1UrlController;
  let v1UrlService: V1UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [V1Url],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([V1Url]),
      ],
      controllers: [V1UrlController],
      providers: [V1UrlService],
    }).compile();

    v1UrlController = module.get<V1UrlController>(V1UrlController);
    v1UrlService = module.get<V1UrlService>(V1UrlService);
  });

  // Test the POST method
  describe('createUrl', () => {
    it('should return the long URL and short URL', async () => {
      const longUrl = 'https://www.npmjs.com';
      const customShortUrl = 'npm';
      const response = await v1UrlController.createUrl({
        longUrl,
        customShortUrl,
      });
      expect(response).toEqual({ longUrl, shortUrl: customShortUrl });
    });

    it('should return the long URL and the same shortUrl', async () => {
      const longUrl = 'https://www.npmjs.com';

      const response1 = await v1UrlController.createUrl({
        longUrl,
        customShortUrl: 'npm',
      });

      const response = await v1UrlController.createUrl({ longUrl });
      expect(response.longUrl).toEqual(longUrl);
      expect(response.shortUrl).toEqual('npm');
    });

    it('should return the long URL and a unique short URL, 6 characters in length', async () => {
      const longUrl = 'https://www.github.com';
      const response = await v1UrlController.createUrl({ longUrl });
      expect(response.longUrl).toEqual(longUrl);
      expect(response.shortUrl.length).toEqual(6);
    });

    it('should return an error message if the custom short URL already exists', async () => {
      const longUrl = 'https://www.github.com';
      const customShortUrl = 'npm';
      try {
        await v1UrlController.createUrl({ longUrl, customShortUrl });
      } catch (error) {
        expect(error.message).toEqual('Custom short URL already exists');
      }
    });

    it('should protect against SQL Injection attacks', async () => {
      const longUrl = "'; DROP TABLE V1Url; --";
      const customShortUrl = "'; DROP TABLE V1Url; --";
      try {
        await v1UrlController.createUrl({ longUrl, customShortUrl });
      } catch (error) {
        expect(error.message).toEqual(
          'Invalid values. Please enter valid values',
        );
      }
    });

    it('should return an error message if the custom short URL is more than 16 characters', async () => {
      const longUrl = 'https://www.github.com';
      const customShortUrl = 'this-is-a-very-long-url';
      try {
        await v1UrlController.createUrl({ longUrl, customShortUrl });
      } catch (error) {
        expect(error.message).toEqual(
          'Custom short URL must be a maximum of 16 characters',
        );
      }
    });

    it('should return an error message if the long url is empty', async () => {
      const longUrl = '';
      try {
        await v1UrlController.createUrl({ longUrl });
      } catch (error) {
        expect(error.message).toEqual('Invalid URL');
      }
    });

    it('should return an error message if the long url is not a valid URL', async () => {
      const longUrl = 'not-a-valid-url';
      try {
        await v1UrlController.createUrl({ longUrl });
      } catch (error) {
        expect(error.message).toEqual('Invalid URL');
      }
    });
  });
});
