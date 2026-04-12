import { Body, Controller, Post, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    console.log('[AUTH REGISTER] received request', { name: dto.name, email: dto.email });
    try {
      const result = await this.authService.register(dto);
      console.log('[AUTH REGISTER] success for email:', dto.email);
      return result;
    } catch (error) {
      console.error('[AUTH REGISTER] error:', error);
      throw error;
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log('[AUTH LOGIN] received request for email:', dto.email);
    try {
      const result = await this.authService.login(dto);
      console.log('[AUTH LOGIN] success for email:', dto.email);
      return result;
    } catch (error) {
      console.error('[AUTH LOGIN] error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    console.log('[AUTH PASSWORD] update requested for user:', req.user.id);
    try {
      const result = await this.authService.updatePassword(req.user.id, dto);
      console.log('[AUTH PASSWORD] success');
      return result;
    } catch (error) {
      console.error('[AUTH PASSWORD] error:', error);
      throw error;
    }
  }
}
