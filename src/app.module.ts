import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { V1UrlController } from './v1/url.controller';
import { V1UrlService } from './v1/url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { V1Url } from './v1/db/url.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [V1Url],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([V1Url]),
  ],
  controllers: [V1UrlController],
  providers: [V1UrlService],
})
export class AppModule {}
