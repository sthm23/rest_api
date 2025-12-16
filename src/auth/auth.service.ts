import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from '@user/user.service';
import { AuthTokenType, type JWTPayload } from './models/auth.models';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { PasswordHashHelper } from '@utils/password-hash.helper';
import { User } from '@user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  async signIn(login: string, password: string): Promise<AuthTokenType> {
    const user = await this.validateUser(login, password);
    if (!user) throw new UnauthorizedException();
    const tokens = await this.getTokens(user);
    return tokens
  }

  async signUp(createUserDto: CreateUserDto): Promise<AuthTokenType> {

    try {
      const newUser = await this.usersService.create(createUserDto);
      const tokens = await this.getTokens(newUser);
      return tokens;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshTokens(dto: JWTPayload & { refreshToken: string }): Promise<AuthTokenType> {
    const user = await this.usersService.findOneById(dto.userId);
    if (!user) throw new ForbiddenException('Access Denied');
    const secret = this.configService.get('JWT_ACCESS');
    const expiresIn = this.configService.get('JWT_ACCESS_EXPIRE');
    try {
      const token = await this.getToken({
        userId: dto.userId,
      }, {
        secret,
        expiresIn
      });
      return {
        accessToken: token,
        refreshToken: dto.refreshToken,
      };
    } catch (error) {
      console.log(error);

      throw new ForbiddenException('Access Denied');

    }
  }

  async logout(payload: JWTPayload): Promise<{ message: string }> {
    const user = await this.usersService.findOneById(payload.userId);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Logout successful' };
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

  private async getTokens(user: Omit<User, 'password'>): Promise<AuthTokenType> {
    const payload = {
      userId: user.id,
    } as JWTPayload;
    try {
      const secret = this.configService.get('JWT_ACCESS');
      const expiresIn = this.configService.get('JWT_ACCESS_EXPIRE');
      const secretRefresh = this.configService.get('JWT_REFRESH');
      const expiresInRefresh = this.configService.get('JWT_REFRESH_EXPIRE');

      const [accessToken, refreshToken] = await Promise.all([
        this.getToken(payload, {
          secret,
          expiresIn,
        }),
        this.getToken(payload, {
          secret: secretRefresh,
          expiresIn: expiresInRefresh,
        }),

      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      throw new ForbiddenException(error?.message);
    }

  }

  private async getToken(payload: JWTPayload, option: JwtSignOptions): Promise<string> {
    return this.jwtService.signAsync(payload, option);
  }
}
