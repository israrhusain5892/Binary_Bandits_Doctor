import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { Patient } from './entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [PatientService],
  controllers: [PatientController],
   imports:[
          TypeOrmModule.forFeature([Patient]),
    ]
})
export class PatientModule {}
