import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
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
import { GoogleAuthGuard } from './guards/google-auth.guards';
import { CreateDoctorDto } from './Dto/create-doctor.dto';
import { DoctorResponseDto } from './Dto/doctor-response.dto';
import { DoctorAvailabilityDto } from './Dto/doctor-availability.dto';

@Controller('/api/v1/auth')
export class AuthController {

  constructor(private readonly usersService: AuthService) { }

  @Post('signup')
  create(@Body() dto: registerUserDto) {
    return this.usersService.create(dto);
  }


  @Post('signin')
  async login(@Body() dto: loginUserDto, @Res({ passthrough: true }) res: Response) {
    return await this.usersService.login(dto);

  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(@Req() req) {
    return await this.usersService.refreshToken(req.user.userId);

  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res() res: Response, @Req() req) {
    this.usersService.signOut(req.user.userId)
    return res.json({ message: "Logged out successfully!!" });
  }


  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req) {

  }

  @Get("/google/callback")
  @UseGuards(GoogleAuthGuard)
  redirectCallBack(@Req() req, @Res() res: Response) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException("Cannot login some thing went wrong!!")
    }
    // Redirect based on role
    const url =
      user.role === 'DOCTOR'
        ? '/profile/doctor'
        : '/profile/patient';
    res.json({
      googleUser: user,
      redirectUrl: url
    })
    return res;

  }

  // create doctor
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Post("add/doctor/profile")
  async createDocotr(@Body() doctorDto: CreateDoctorDto): Promise<DoctorResponseDto> {
    return this.usersService.createDoctor(doctorDto);
  }
  //  serach doctor by name
  @UseGuards(JwtAuthGuard)
  @Get("doctor/search")
  async getDoctorByName(@Query("name") name: string): Promise<DoctorResponseDto[]> {
    return this.usersService.findByDoctorName(name);
  }
  // get doctor profile by unique id
  @UseGuards(JwtAuthGuard)
  @Get("doctor/profile/:id")
  async getDoctorProfile(@Param('id', ParseUUIDPipe) id: string): Promise<DoctorResponseDto | any> {
    return this.usersService.getDoctorProfile(id)
  }
  // get List of doctorrs
  @UseGuards(JwtAuthGuard)
  @Get("doctors")
  async getAllDoctorsList(): Promise<DoctorResponseDto[]> {
    return this.usersService.findAllDoctors();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Get('profile/:id')
  getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.validateJwtUser(id);
  }



  // doctor availability logic controller here
  // create doctor availability
  @Post('doctors/:id/availability')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(Role.DOCTOR)
  async createDoctorAvailability(@Param("id",ParseUUIDPipe) id:string ,@Body() dto:DoctorAvailabilityDto){
     return this.usersService.createDoctorAvailability(id,dto);
  }


//  get doctor availability by doctor id
  @Get('doctors/:id/availability')
  @UseGuards(JwtAuthGuard) // or 'doctor' depending on who accesses
  async getAvailability(
    @Param('id', ParseUUIDPipe) doctorId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.getAvailableTiemSlotsByDoctorId(doctorId,+page,+limit);
  }

}
