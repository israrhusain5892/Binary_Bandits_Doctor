import { User } from "src/auth/entities/user.entity";
import { Doctor } from "./doctor.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DoctorTimeSlots } from "./doctor-time-slots";
import { Status } from "src/auth/enums/status.enum";


@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  bookingId: string;

  @ManyToOne(() => Doctor, doctor => doctor.appointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => User, user => user.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ManyToOne(() => DoctorTimeSlots)
  timeSlot: DoctorTimeSlots;

  @Column()
  date: string;

  @Column()
  session: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column()
  reporting_time: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @CreateDateColumn()
  booked_date: Date;

  @UpdateDateColumn()
  booked_update_date: Date;


}
