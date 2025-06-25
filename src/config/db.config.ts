// src/database.config.ts
import { User } from 'src/auth/entities/user.entity';
import {PostgresConnectionOptions} from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { registerAs } from '@nestjs/config';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { DoctorAvailability } from 'src/doctor/entities/doctor-availability';
import { DoctorTimeSlots } from 'src/doctor/entities/doctor-time-slots';
export default registerAs  (
  'dbconfig.dev',
  ():PostgresConnectionOptions=>({
  type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5433' ||'5434', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User,Patient,Doctor,DoctorAvailability,DoctorTimeSlots],
    synchronize: true,
  })

   
);
