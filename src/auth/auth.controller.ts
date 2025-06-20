import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerUserDto } from './Dto/register-user.dto';
import { loginUserDto } from './Dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { Request, Response } from 'express';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './enums/role.enum';
import { Roles } from './decorators/custom.role.decorator';

@Controller('/api/v1/auth')
export class AuthController {

  constructor(private readonly usersService: AuthService) { }

  @Post('signup')
  create(@Body() dto: registerUserDto) {
    return this.usersService.create(dto);
  }


  @Post('signin')
  async login(@Body() dto: loginUserDto,@Res({passthrough:true}) res:Response) {
    const user= this.usersService.login(dto);
   
    const{tokens}=await this.usersService.login(dto);
  
    res.cookie('refresh_token',tokens.refreshToken,{
      httpOnly:true,
      sameSite:'lax',
      secure:false,
      path:'/api/v1/auth/refresh',
      maxAge:7*24*60*60*1000
    })
    return user;
  }


  @Get('refresh')
  async refresh(@Req() req:Request,@Res() res:Response){
    const refreshToken=req.cookies['refresh_token'];
    if(refreshToken){
      throw new UnauthorizedException("No refresh token found")
    }
    const access_token=this.usersService.getAccessTokenFromRefresh(refreshToken);
    return res.json({access_token});
  }


  @Post('logout')
  logout(@Res() res:Response){
    res.clearCookie('refresh_token',{path:'/api/v1/auth/refresh'});
    return res.json({message:"Logged out successfully!!"});
  }


   @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  getProfile(@Param('id', ParseUUIDPipe) id: string) {
     return this.usersService.findUserById(id);
  }

}
