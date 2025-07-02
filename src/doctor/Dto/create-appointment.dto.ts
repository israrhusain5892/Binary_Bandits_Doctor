import { IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  doctor_id: string;

  @IsDateString()
  date: string;

  @IsString()
  session: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;
}
