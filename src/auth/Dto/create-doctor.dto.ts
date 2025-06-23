import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty({message:"Doctor specialization is required!!"})
  specialization: string;

  
  @IsNotEmpty({message:"experience is required!!"})
  experience_years: number;

  @IsString()
  @IsNotEmpty({message:"education is required!!"})
  education: string;

  @IsString()
  @IsOptional()
  clinic_name: string;

  @IsString()
  @IsOptional()
  clinic_address: string;

  
  @IsNotEmpty({message:"Availability days is required!!"})
  available_days: string[];

  
  @IsNotEmpty({message:"Time slots is required!!"})
  available_time_slots: string[];

  
  @IsNotEmpty({message:"achivements is required!!"})
  achievements?: string[];

   @IsString()
  @IsNotEmpty({message:"user id is required!!"})
  user_id: string;
}