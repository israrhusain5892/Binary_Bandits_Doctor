import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';


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
  available_days: string[];

  @Column({ type: 'simple-array' })
  available_time_slots: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.doctor)
   @JoinColumn()
   user:User;
}