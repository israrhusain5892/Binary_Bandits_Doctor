import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { registerUserDto } from './Dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { loginUserDto } from './Dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import refreshJwtConfig from 'src/config/refresh-jwt.config';
import *as bcrypt from "bcrypt";
import { CreateDoctorDto } from '../doctor/Dto/create-doctor.dto';
import { DoctorResponseDto } from '../doctor/Dto/doctor-response.dto';
import { Doctor } from '../doctor/entities/doctor.entity';
import { DoctorAvailabilityDto } from '../doctor/Dto/doctor-availability.dto';
import { DoctorAvailability } from '../doctor/entities/doctor-availability';

import { DoctorTimeSlots } from '../doctor/entities/doctor-time-slots';
@Injectable()
export class AuthService {




  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof jwtConfig>,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) { }


  // by defualt it register user with user role
  async create(registerUserDto: registerUserDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerUserDto.email } });
    if (existingUser) {
      throw new ConflictException(`User already registered with Email ${existingUser.email}`);
    }
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const user = this.userRepository.create({ ...registerUserDto, password: hashedPassword });
    const savedUser = this.userRepository.save(user);
    return savedUser;

  }

  async login(loginUserDto: loginUserDto) {
    const findUser = await this.userRepository.findOne({ where: { email: loginUserDto.email } });
    if (!findUser) {
      throw new NotFoundException("User not registered!!");
    }
    const hashedPassword = findUser.password;
    if (!bcrypt.compare(hashedPassword, loginUserDto.password)) {
      throw new UnauthorizedException("User authentication unauthorized");
    }
    const { accessToken, refreshToken } = await this.generateJwtTokens(findUser);
    // not send password to client
    const hashedRefresahToken = bcrypt.hash(refreshToken, 10)
    await this.updateRefeshTokenInDB(findUser.userId, hashedRefresahToken);
    const { password, ...user } = findUser;

    return {
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: "login successfully"
    }
  }


  async generateJwtTokens(user: any) {
    const payload = { sub: user.userId, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtTokenConfig.secret,
      expiresIn: this.jwtTokenConfig.signOptions?.expiresIn,
    });
    // refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshJwtTokenConfig.secret,
      expiresIn: this.refreshJwtTokenConfig.signOptions?.expiresIn
    })

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }


  async updateRefeshTokenInDB(userId: string, refresh_Token: any) {
    return await this.userRepository.update({ userId: userId }, { refresh_Token });
  }


  async validateJwtUser(userId: string) {
    const user = this.userRepository.findOne({ where: { userId: userId } });
    if (!user) {
      throw new NotFoundException("user not found by Id to validate");
    }
    return user;
  }


   async findUserByUserId(userId: string) {
    const user = this.userRepository.findOne({ where: { userId: userId } });
    if (!user) {
      throw new NotFoundException("user not found");
    }
    return user;
  }


  async refreshToken(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { userId: id } });
      const { refreshToken, accessToken } = await this.generateJwtTokens(user);
      await this.updateRefeshTokenInDB(id, bcrypt.hash(refreshToken, 10));
      return {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,

      }

    }
    catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

  }

  async validateRefreshToken(userId: string, refresh_Token: any) {

    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user || !user.refresh_Token) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const isMatchRefreshToken = bcrypt.compare(refresh_Token, user.refresh_Token);
    if (!isMatchRefreshToken) {
      throw new UnauthorizedException("Invalid refresh Token");
    }
    return user;
  }



  async signOut(userId: string) {
    await this.updateRefeshTokenInDB(userId, null);
  }



  async validateGoogleUser(profileData: registerUserDto) {
    const email = profileData.email;
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      const newUser = this.userRepository.create(profileData);
      await this.userRepository.save(newUser);
      throw new NotFoundException("Account is registered via Google. Please login with Google")
    }

    const payload = { sub: user.userId, email: user.email, role: user.role };
    const { accessToken } = await this.generateJwtTokens(payload);

    return { ...user, accessToken: accessToken };

  }






}



