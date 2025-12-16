import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { LocalAuthGuard } from './guard/local_passport.guard';
import { RefreshTokenGuard } from './guard/refresh-token.guard';
import { AuthJWTGuard } from './guard/auth.guard';
import { User } from '@utils/user-decorator';
import { type JWTPayload } from './models/auth.models';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: CreateUserDto) {
    return this.authService.signIn(signInDto.login, signInDto.password);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signin/new_token')
  refreshToken(@User() payload: JWTPayload & { refreshToken: string }) {
    return this.authService.refreshTokens(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @UseGuards(AuthJWTGuard)
  @Get('logout')
  logOut(@User() payload: JWTPayload) {
    return this.authService.logout(payload);
  }
}
