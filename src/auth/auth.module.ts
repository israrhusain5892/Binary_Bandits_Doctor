import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Patient } from '../patient/entities/patient.entity';
import jwtConfig from 'src/config/jwt.config';
import refreshJwtConfig from 'src/config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import googleConfig from 'src/config/google.config';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { RolesGuard } from './guards/roles.guard';
import { GoogleAuthGuard } from './guards/google-auth.guards';
import { JwtRefreshGuard } from './guards/jwt-refresh.guards';
import { PassportModule } from '@nestjs/passport';


@Module({
  providers: [AuthService, JwtService, JwtStrategy,RefreshJwtStrategy,
    ConfigService,GoogleStrategy,JwtAuthGuard,RolesGuard,GoogleAuthGuard,JwtRefreshGuard
  ],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User]),
     PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleConfig),
  
  ],
  exports:[AuthService,JwtAuthGuard,RolesGuard]

})
export class AuthModule { }
