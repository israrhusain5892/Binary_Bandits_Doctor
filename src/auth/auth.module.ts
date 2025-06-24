import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Patient } from './entities/patient.entity';
import { Doctor } from './entities/doctor.entity';
import jwtConfig from 'src/config/jwt.config';
import refreshJwtConfig from 'src/config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import googleConfig from 'src/config/google.config';
import { DoctorAvailability } from './entities/doctor-availability';
import { DoctorTimeSlots } from './entities/doctor-time-slots';

@Module({
  providers: [AuthService, JwtService, JwtStrategy,RefreshJwtStrategy,
    ConfigService,GoogleStrategy],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, Patient, Doctor,DoctorAvailability,DoctorTimeSlots]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleConfig)
  ]

})
export class AuthModule { }
