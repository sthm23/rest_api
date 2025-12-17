
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from '@auth/models/auth.models';
import { TokenService } from '@token/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(config: ConfigService, private tokensService: TokenService) {
        const secretOrKey = config.get('JWT_ACCESS_SECRET');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey,

        });
    }

    async validate(payload: JWTPayload) {
        const session = await this.tokensService.findSession(payload.sessionId!);

        if (!session || session.isRevoked) {
            throw new UnauthorizedException();
        }
        return payload;
    }
}
