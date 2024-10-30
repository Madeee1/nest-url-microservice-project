import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsNotEmpty()
  longUrl: string;

  @ApiProperty({ example: 'customurl' })
  customShortUrl?: string;
}
