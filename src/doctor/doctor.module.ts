import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorAvailability } from './entities/doctor-availability';
import { DoctorTimeSlots } from './entities/doctor-time-slots';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { GoogleStrategy } from 'src/auth/strategies/google.strategy';
import { RefreshJwtStrategy } from 'src/auth/strategies/refresh-jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import refreshJwtConfig from 'src/config/refresh-jwt.config';
import googleConfig from 'src/config/google.config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [DoctorService],
  controllers: [DoctorController],
  imports: [
    TypeOrmModule.forFeature([Doctor, DoctorAvailability, DoctorTimeSlots]),
    AuthModule
  ]

})
export class DoctorModule { }
