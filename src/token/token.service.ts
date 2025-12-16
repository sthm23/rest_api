import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { PasswordHashHelper } from '@utils/password-hash.helper';
import { addDays } from '@utils/date.utils';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly repo: Repository<Token>,
  ) { }

  async saveRefreshToken(userId: number, refreshToken: string) {
    const hash = await PasswordHashHelper.hash(refreshToken, 10);

    const token = this.repo.create({
      userId,
      refreshTokenHash: hash,
      expiresAt: addDays(new Date(), 7),
    });

    await this.repo.save(token);
  }

  async findValidToken(userId: number, refreshToken: string) {
    const tokens = await this.repo.find({
      where: { userId, isRevoked: false },
    });

    for (const token of tokens) {
      const isMatch = await PasswordHashHelper.isMatch(
        refreshToken,
        token.refreshTokenHash,
      );
      if (isMatch) return token;
    }

    return null;
  }

  async revokeToken(tokenId: string) {
    await this.repo.update(tokenId, { isRevoked: true });
  }

  async revokeByRefreshToken(refreshToken: string, userId?: number) {
    const tokens = await this.repo.find({ where: { isRevoked: false, userId } });

    for (const token of tokens) {
      const match = await PasswordHashHelper.isMatch(
        refreshToken,
        token.refreshTokenHash,
      );
      if (match) {
        token.isRevoked = true;
        await this.repo.save(token);
        return;
      }
    }
  }
}
