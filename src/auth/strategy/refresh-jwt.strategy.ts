// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    private config: ConfigService,
    private usersService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback:true,
      secretOrKey: "super-secret-key",
      algorithms: ['HS256'],  
    });
  }

  async validate(req:Request,payload: any) {
    const refreshToken=req.get('authorization')?.replace('Bearer','').trim();
    const userId=payload.sub;
    return this.usersService.validateRefreshToken(userId,refreshToken);
  }
}
