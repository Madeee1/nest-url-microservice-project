import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlRespDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsNotEmpty()
  longUrl: string;

  @ApiProperty({ example: 'customurl' })
  @IsNotEmpty()
  shortUrl: string;

  @ApiProperty({ example: '2021-07-10T00:00:00.000Z' })
  @IsNotEmpty()
  expiresAt: Date;
}
