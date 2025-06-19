import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guards';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [AuthService,JwtService,JwtStrategy,JwtAuthGuard,ConfigService],
  controllers: [AuthController],
  imports: [TypeOrmModule.forFeature([User])]
 
})
export class AuthModule {}
