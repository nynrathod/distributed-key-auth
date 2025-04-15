import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateAuthKeyDto {
  @IsOptional()
  @IsInt()
  rateLimit?: number;

  @IsOptional()
  @IsNumber()
  expiration?: number;
}
