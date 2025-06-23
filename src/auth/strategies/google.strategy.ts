// src/auth/strategies/google.strategy.ts
import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import googleOauthConfig from 'src/config/google.config';
import { Strategy } from 'passport-google-oauth20';
import googleConfig from 'src/config/google.config';
import { profile } from 'console';
import { Role } from '../enums/role.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(

        @Inject(googleConfig.KEY)
        private google: ConfigType<typeof googleConfig>,

        private authService: AuthService
    ) {
        super({

            clientID: google.clientID as string,
            clientSecret: google.clientSecret as string,
            callbackURL: google.callbackURL as string,
            scope: ['email', 'profile'],
            passReqToCallback: true,
   
        });
        
    }

    async validate(
        request: any,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: Function,
    ) {
        try {
            const state = (request.query.state);
            if(!state){
               throw new NotFoundException("Role is not found in query   parameter")
            }
           
            const existRole = state.toUpperCase() || Role.PATIENT;
          
            const profileData = {
                name: profile.displayName,
                email: profile.emails[0].value,
                password: '',
                avatarUrl: profile.photos[0].value,
                role: existRole,
                provider:profile.provider   

            }
            const user = await this.authService.validateGoogleUser(profileData);
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
}
