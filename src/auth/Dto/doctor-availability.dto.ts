import { IsDateString, IsString } from "class-validator";

export class DoctorAvailabilityDto {
  @IsDateString()
  date: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsString()
  session: 'morning' | 'evening';
}
