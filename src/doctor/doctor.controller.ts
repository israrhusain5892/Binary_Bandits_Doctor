import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/custom.role.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { DoctorAvailabilityDto } from './Dto/doctor-availability.dto';
import { DoctorResponseDto } from './Dto/doctor-response.dto';
import { CreateDoctorDto } from './Dto/create-doctor.dto';
import { UpdateScheduleTypeDto } from './Dto/updateSheduleType.dto';
import { CreateAppointmentDto } from './Dto/create-appointment.dto';
import { Request } from 'express';

@Controller("api/v1/doctors")
export class DoctorController {

  constructor(private readonly doctorService: DoctorService) { }



  // create doctor
  @Post("profile")
  @Roles(Role.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createDoctor(@Body() doctorDto: CreateDoctorDto): Promise<DoctorResponseDto> {
    return this.doctorService.createDoctor(doctorDto);
  }
  //  serach doctor by name
  @UseGuards(JwtAuthGuard)
  @Get("/search")
  async getDoctorByName(@Query("name") name: string): Promise<DoctorResponseDto[]> {
    return this.doctorService.findByDoctorName(name);
  }
  // get doctor profile by unique id
  @UseGuards(JwtAuthGuard)
  @Get("/profile/:id")
  async getDoctorProfile(@Param('id', ParseUUIDPipe) id: string): Promise<DoctorResponseDto | any> {
    return this.doctorService.getDoctorProfile(id)
  }
  // get List of doctorrs
  @UseGuards(JwtAuthGuard)
  @Get("/")
  async getAllDoctorsList(): Promise<DoctorResponseDto[]> {
    return this.doctorService.findAllDoctors();
  }



  // doctor availability logic controller here
  // create doctor availability
  @Post(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async createDoctorAvailability(@Param("id", ParseUUIDPipe) id: string, @Body() dto: DoctorAvailabilityDto) {
    return this.doctorService.createDoctorAvailability(id, dto);
  }


  //  get doctor availability by doctor id
  @Get(':id/availability')
  @UseGuards(JwtAuthGuard) // or 'doctor' depending on who accesses
  async getAvailability(
    @Param('id', ParseUUIDPipe) doctorId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.doctorService.getAvailableTiemSlotsByDoctorId(doctorId, +page, +limit);
  }


  // doctor schedule type update

  @Patch(':id/schedule_type')
  @UseGuards(JwtAuthGuard, RolesGuard) // Ensure only doctors can do this
  @Roles(Role.DOCTOR)
  async updateScheduleType(
    @Param('id') doctor_id: string,
    @Body() dto: UpdateScheduleTypeDto,@Req() req) {
    console.log(req.user)
    return await this.doctorService.updateScheduleType(doctor_id, dto);

  }


  @Post('appointments')
  @UseGuards(JwtAuthGuard) // only logged-in patients
  async createAppointment(@Req() req:Request, @Body() dto: CreateAppointmentDto) {
   const patient_id = (req.user as { userId: string }).userId;
  
    return await this.doctorService.bookAppointment(patient_id, dto);
  }


}
