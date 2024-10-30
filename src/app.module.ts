import { Module } from '@nestjs/common';
import { V1UrlController } from './v1/url.controller';
import { V1UrlService } from './v1/url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { V1Url } from './v1/db/url.entity';
import { User } from './v1/db/user.entity';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './v1/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [V1Url, User],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([V1Url]),
    ThrottlerModule.forRoot([
      {
        ttl: 20000,
        limit: 10,
      },
    ]),
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [V1UrlController],
  providers: [
    V1UrlService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
