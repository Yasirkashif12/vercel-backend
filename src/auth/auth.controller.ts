import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}
  @Post('/register')
  async register(
    @Body(ValidationPipe) authcredentialdto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authservice.signup(authcredentialdto);
  }
  @Post('/login')
  async login(
    @Body(ValidationPipe) authcredentialdto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authservice.signin(authcredentialdto);
  }
}
