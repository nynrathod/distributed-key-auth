import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UsePipes,
  ValidationPipe,
  Put,
  Logger,
} from '@nestjs/common';
import { AuthKeyService } from './auth-key.service';
import { CreateAuthKeyDto } from './dto/create-auth-key.dto';
import { UpdateAuthKeyDto } from './dto/update-auth-key.dto';
import { AuthKey } from './entities/auth-key.entity';

@Controller('auth-keys')
export class AuthKeyController {
  // Logger instance for this controller
  private readonly logger = new Logger(AuthKeyController.name);

  constructor(private readonly authKeyService: AuthKeyService) {}

  // Generate a new Auth Key
  @Post('generate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async generate(@Body() createAuthKeyDto: CreateAuthKeyDto): Promise<AuthKey> {
    this.logger.log('Generating new auth key...');
    const result = await this.authKeyService.generateKey(
      createAuthKeyDto.userId,
      createAuthKeyDto.rateLimit,
      createAuthKeyDto.expiration,
    );
    this.logger.log('Auth key generated successfully');
    return result;
  }

  // Delete an Auth Key
  @Delete('delete/:key')
  async delete(@Param('key') key: string) {
    this.logger.log(`Attempting to delete auth key: ${key}`);
    await this.authKeyService.deleteKey(key);
    this.logger.log(`Auth key with ID: ${key} deleted successfully`);
    return {
      message: `Auth key with ID: ${key} deleted successfully`,
    };
  }

  // Update an Auth Key
  @Put('update/:key')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('key') key: string,
    @Body() updateAuthKeyDto: UpdateAuthKeyDto,
  ): Promise<AuthKey> {
    this.logger.log(`Attempting to update auth key: ${key}`);
    const result = await this.authKeyService.updateKey(
      key,
      updateAuthKeyDto.rateLimit,
      updateAuthKeyDto.expiration,
    );
    this.logger.log(`Auth key with ID: ${key} updated successfully`);
    return result;
  }

  // Get details for a specific Auth Key
  @Get(':key')
  async getDetails(@Param('key') key: string): Promise<AuthKey> {
    this.logger.log(`Fetching details for auth key: ${key}`);
    const result = await this.authKeyService.getUserDetails(key);
    this.logger.log(`Details fetched for auth key: ${key}`);
    return result;
  }

  // Disable a specific Auth Key
  @Post('disable/:key')
  async disable(@Param('key') key: string): Promise<AuthKey> {
    this.logger.log(`Attempting to disable auth key: ${key}`);
    const result = await this.authKeyService.disableKey(key);
    this.logger.log(`Auth key with ID: ${key} disabled successfully`);
    return result;
  }
}
