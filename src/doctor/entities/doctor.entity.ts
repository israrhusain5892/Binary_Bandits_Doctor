import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { DoctorAvailability } from './doctor-availability';
import { DoctorTimeSlots } from './doctor-time-slots';


@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  doctor_id: string;

  @Column({ type: 'varchar', length: 100 })
  specialization: string;

  @Column({ type: 'int' })
  experience_years: number;

  @Column({ type: 'text' })
  education: string;

  @Column({ type: 'varchar', length: 255 })
  clinic_name: string;

  @Column({ type: 'text' })
  clinic_address: string;

  
  @Column({ type: 'simple-array' })
  achievements?: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.doctor)
  @JoinColumn()
  user: User;

  @OneToMany(() => DoctorAvailability, availability => availability.doctor, { cascade: true })
  availabilities: DoctorAvailability[];

  @OneToMany(() => DoctorTimeSlots, slot => slot.doctor)
  timeSlots: DoctorTimeSlots[];
}