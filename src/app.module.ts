import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { V1UrlController } from './v1/url.controller';
import { V1UrlService } from './v1/url.service';

@Module({
  imports: [],
  controllers: [V1UrlController],
  providers: [V1UrlService],
})
export class AppModule {}
