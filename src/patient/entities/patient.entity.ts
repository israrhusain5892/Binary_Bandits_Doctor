import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  patient_id: string;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ type: 'varchar', length: 10 })
  gender: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  emergency_contact: string;

  @Column({ type: 'text', nullable: true })
  medical_history: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.patient)
  @JoinColumn()
  user:User;
}