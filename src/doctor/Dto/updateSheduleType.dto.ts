import { IsEnum, IsOptional } from "class-validator";

// DTO
export class UpdateScheduleTypeDto {
  @IsEnum(['stream', 'wave'])
  schedule_type: 'stream' | 'wave';

  @IsOptional()
  preferred_slot_duration:number;
}


