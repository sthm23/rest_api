import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from '@user/user.service';
import { AuthTokenType, type JWTPayload } from './models/auth.models';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { PasswordHashHelper } from '@utils/password-hash.helper';
import { User } from '@user/entities/user.entity';
import { TokenService } from '@token/token.service';
import { type Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private tokensService: TokenService,
  ) { }

  async signin(res: Response, dto: CreateUserDto) {
    const user = await this.validateUser(dto.login, dto.password);
    if (!user) throw new UnauthorizedException();
    const tokens = await this.login(user.id);

    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async refreshToken(res: Response, refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.refreshTokens(refreshToken);

    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokenType> {
    const secret = process.env.JWT_REFRESH_SECRET;
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret
    });

    const tokenFromDb =
      await this.tokensService.findValidToken(payload.sub, refreshToken);

    if (!tokenFromDb) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.tokensService.revokeToken(tokenFromDb.id);

    const newRefreshToken = await this.generateToken({ sub: payload.sub }, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRE as any,
    });

    const savedToken = await this.tokensService.saveRefreshToken(
      payload.sub,
      newRefreshToken,
    );
    const accessToken = await this.generateToken({ sub: payload.sub, sessionId: savedToken.id }, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRE as any,
    });
    return { accessToken, refreshToken };
  }

  async signUp(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      const tokens = await this.login(user.id);
      return tokens;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async logout(res: Response & { user?: User }, refreshToken?: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException('Refresh token not found');
      }
      await this.tokensService.revokeByRefreshToken(refreshToken, res.user?.id);

      res.clearCookie('refreshToken', { path: '/' });
      return { message: 'Logged out' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateUser(login: string, pass: string): Promise<User | null> {
    try {
      const user = await this.usersService.findOneByLogin(login);
      if (!user) throw new NotFoundException('User not found');
      if (!user.isActive) throw new ForbiddenException('User is deactivated');
      const isMatch = await PasswordHashHelper.isMatch(pass, user.password);
      if (user && isMatch) {
        return user;
      }
      return null;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  private async login(userId: number) {

    const refreshToken = await this.generateToken({ sub: userId }, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRE as any,
    });

    const savedToken = await this.tokensService.saveRefreshToken(
      userId,
      refreshToken,
    );
    const accessToken = await this.generateToken({ sub: userId, sessionId: savedToken.id }, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRE as any,
    });
    return { accessToken, refreshToken };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/',
    });
  }

  private generateToken(payload: JWTPayload, options: JwtSignOptions) {
    return this.jwtService.signAsync(payload, options);
  }
}
