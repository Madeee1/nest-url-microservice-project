import { Test, TestingModule } from '@nestjs/testing';
import { V1UrlController } from './url.controller';
import { V1UrlService } from './url.service';

describe('AppController', () => {
  let v1UrlController: V1UrlController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [V1UrlController],
      providers: [V1UrlService],
    }).compile();

    v1UrlController = app.get<V1UrlController>(V1UrlController);
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
  });
});
