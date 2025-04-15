import { IsString, IsInt, IsNumber } from 'class-validator';

export class CreateAuthKeyDto {
  @IsString()
  userId: string;

  @IsInt()
  rateLimit: number;

  @IsNumber()
  expiration: number;
}
