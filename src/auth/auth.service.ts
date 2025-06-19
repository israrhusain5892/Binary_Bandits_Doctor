import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { registerUserDto } from './Dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { loginUserDto } from './Dto/login-user.dto';
import *as bcryptjs from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
 

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService:JwtService
  ) { }

  async create(registerUserDto: registerUserDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerUserDto.email } });
    if (existingUser) {
      throw new ConflictException(`User already registered with Email ${existingUser.email}`);
    }
    const hashedPassword=await bcryptjs.hash(registerUserDto.password,10);
    const user = this.userRepository.create({...registerUserDto, password:hashedPassword});
    const savedUser = this.userRepository.save(user);
    return savedUser;

  }
  async login(loginUserDto:loginUserDto){
      const findUser=await this.userRepository.findOne({where:{email:loginUserDto.email}});
      if(!findUser){
        throw new NotFoundException("User not registered!!");
      }
      const hashedPassword=findUser.password;
      if(!bcryptjs.compare(hashedPassword,loginUserDto.password)){
        throw new UnauthorizedException("User authentication unauthorized");
      }
      const tokens=await this.generateTokens(findUser);
      // not send password to client
      const{password,...user}=findUser; 
      return {
         user:user,
         tokens:tokens,
         message:"login successfully"
      }
    }

   async generateTokens(user:any){
        const payload={sub:user.userId,email:user.email};
        const accessToken=await this.jwtService.signAsync(payload,{secret:"secret_key",expiresIn:"15m"});
        const refreshToken=await this.jwtService.signAsync(payload,{secret:"secret_key",expiresIn:"7d"})
        return {
           accessToken:accessToken,
           refreshToken:refreshToken
        };
    }
  
  

  async findUserById(userId:string){
      const user=this.userRepository.findOne({where:{userId:userId}});
      if(!user){
        throw new NotFoundException("user not found by Id to validate");
      }
      return user;
  }


   async getAccessTokenFromRefresh(refreshToken: any) {
    try{
      const payload=await this.jwtService.verify(refreshToken);
      const access_token=this.jwtService.sign({sub:payload.sub,email:payload.email},{expiresIn:'15m'});
      return access_token;

    }
    catch(error){
        throw new UnauthorizedException('Invalid refresh token');
    }
    
  }

}
