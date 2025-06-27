
import { User } from 'src/auth/entities/user.entity';
import { DoctorAvailability } from 'src/doctor/entities/doctor-availability';
import { DoctorTimeSlots } from 'src/doctor/entities/doctor-time-slots';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
export default (): PostgresConnectionOptions => ({

  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Patient, Doctor, DoctorAvailability, DoctorTimeSlots],
  synchronize: false, // Set to false for production
  ssl: true

}

);
