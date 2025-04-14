import { IsString, IsInt, IsDateString } from 'class-validator';

export class CreateAuthKeyDto {
    @IsString()
    userId: string;

    @IsInt()
    rateLimit: number;

    @IsDateString()
    expiration: string;  // ISO 8601 format string
}