import { IsInt, IsDateString } from 'class-validator';

export class UpdateAuthKeyDto {
    @IsInt()
    rateLimit: number;

    @IsDateString()
    expiration: string;
}