import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { ConfigService } from '@nestjs/config';
import { Patient } from './entities/patient.entity';
import { Doctor } from './entities/doctor.entity';

@Module({
  providers: [AuthService,JwtService,JwtStrategy,JwtAuthGuard,ConfigService],
  controllers: [AuthController],
  imports: [TypeOrmModule.forFeature([User,Patient,Doctor])]
 
})
export class AuthModule {}
