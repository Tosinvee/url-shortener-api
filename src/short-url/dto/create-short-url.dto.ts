import { IsUrl, IsOptional, IsString, IsISO8601 } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  custom_alias?: string;

  @IsOptional()
  @IsISO8601()
  expiration_date?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
