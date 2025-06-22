import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Patient } from './entities/patient.entity';
import { Doctor } from './entities/doctor.entity';
import jwtConfig from 'src/config/jwt.config';
import refreshJwtConfig from 'src/config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategy/refresh-jwt.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guards';

@Module({
  providers: [AuthService, JwtService, JwtStrategy,RefreshJwtStrategy,
    JwtRefreshGuard, JwtAuthGuard, ConfigService],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, Patient, Doctor]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig)
  ]

})
export class AuthModule { }
