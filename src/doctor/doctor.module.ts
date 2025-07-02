import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorAvailability } from './entities/doctor-availability';
import { DoctorTimeSlots } from './entities/doctor-time-slots';
import { AuthModule } from 'src/auth/auth.module';
import { Appointment } from './entities/Appointment';

@Module({
  providers: [DoctorService],
  controllers: [DoctorController],
  imports: [
    TypeOrmModule.forFeature([Doctor, DoctorAvailability, DoctorTimeSlots,Appointment]),
    AuthModule ]

})
export class DoctorModule { }
