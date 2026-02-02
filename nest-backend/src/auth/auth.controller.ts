import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class CreateSessionDto {
  idToken: string;
}

/**
 * POST /auth/session: receive ID token from Next.js proxy, mint session cookie, return string.
 * Next.js will set it as HttpOnly cookie.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('session')
  async createSession(@Body() dto: CreateSessionDto) {
    const { idToken } = dto;
    if (!idToken || typeof idToken !== 'string') {
      throw new BadRequestException('idToken is required');
    }
    return this.authService.createSession(idToken);
  }
}
