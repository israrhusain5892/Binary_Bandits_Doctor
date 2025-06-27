// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import refreshJwtConfig from 'src/config/refresh-jwt.config';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof refreshJwtConfig>,
    private usersService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: jwtTokenConfig.secret as string,
      algorithms: ['HS256']
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();
    const userId = payload.sub;
    return this.usersService.validateRefreshToken(userId, refreshToken);
  }
}
