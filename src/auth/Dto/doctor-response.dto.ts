// doctor-response.dto.ts

export class DoctorResponseDto {
  doctor_id: string;
  name: string;
  email: string;
  specialization: string;
  experience_years: number;
  education: string;
  clinic_name: string;
  clinic_address: string;
  available_days: string[];
  available_time_slots: string[];
  achievements?: string[];
  created_at: Date;
  updated_at: Date;
  
}
