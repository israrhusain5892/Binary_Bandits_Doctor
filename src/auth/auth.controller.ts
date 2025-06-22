import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerUserDto } from './Dto/register-user.dto';
import { loginUserDto } from './Dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { Request, Response } from 'express';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './enums/role.enum';
import { Roles } from './decorators/custom.role.decorator';
import { User } from './entities/user.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guards';

@Controller('/api/v1/auth')
export class AuthController {

  constructor(private readonly usersService: AuthService) { }

  @Post('signup')
  create(@Body() dto: registerUserDto) {
    return this.usersService.create(dto);
  }


  @Post('signin')
  async login(@Body() dto: loginUserDto,@Res({passthrough:true}) res:Response) {
    return await this.usersService.login(dto);
    
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(@Req() req){
      return await this.usersService.refreshToken(req.user.userId);
    
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res() res:Response,@Req() req){
    this.usersService.signOut(req.user.userId)
    return res.json({message:"Logged out successfully!!"});
  }


  
  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(Role.DOCTOR)
   @Get('profile/:id')
  getProfile(@Param('id', ParseUUIDPipe) id: string) {
     return this.usersService.validateJwtUser(id);
  }

}
