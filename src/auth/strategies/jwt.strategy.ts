// src/auth/strategies/jwt.strategy.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import jwtConfig from 'src/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof jwtConfig>,
    private usersService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
       passReqToCallback:true,
       secretOrKey: jwtTokenConfig.secret as string,
      algorithms: ['HS256']  
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.validateJwtUser(payload.sub);
   
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user; // attaches `user` to `req.user`
  }
}
