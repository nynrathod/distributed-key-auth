// src/auth-key/auth-key.controller.ts
import { Controller, Post, Body, Param, Get, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthKeyService } from './auth-key.service';
import { CreateAuthKeyDto } from './dto/create-auth-key.dto';
import { UpdateAuthKeyDto } from './dto/update-auth-key.dto';
import { AuthKey } from './entities/auth-key.entity';

@Controller('auth-keys')
export class AuthKeyController {
    constructor(private readonly authKeyService: AuthKeyService) {}

    // Generate a new Auth Key
    @Post('generate')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async generate(@Body() createAuthKeyDto: CreateAuthKeyDto): Promise<AuthKey> {
        return this.authKeyService.generateKey(createAuthKeyDto.userId, createAuthKeyDto.rateLimit, new Date(createAuthKeyDto.expiration));
    }

    // Delete an Auth Key
    @Delete(':key')
    async delete(@Param('key') key: string): Promise<AuthKey> {
        return this.authKeyService.deleteKey(key);
    }

    // Update an Auth Key
    @Post('update/:key')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async update(
        @Param('key') key: string,
        @Body() updateAuthKeyDto: UpdateAuthKeyDto,
    ): Promise<AuthKey> {
        return this.authKeyService.updateKey(key, updateAuthKeyDto.rateLimit, new Date(updateAuthKeyDto.expiration));
    }

    // Get details for a specific Auth Key
    @Get(':key')
    async getDetails(@Param('key') key: string): Promise<AuthKey> {
        return this.authKeyService.getUserDetails(key);
    }
}
