import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Doctor } from "./doctor.entity";

@Entity('doctor_time_slots')
export class DoctorTimeSlots {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ default: true })
    is_available: boolean;

    @Column({default:"Morning"})
    session: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ default: 0 })
    current_bookings: number;

    @Column({ default: 3 }) // only for wave scheduling
    max_bookings: number;

    @ManyToOne(() => Doctor, doctor => doctor.timeSlots, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctor_id' })
    doctor: Doctor;
    //    add extra field doctor id as foreign key
    @Column()
    doctor_id: string;
}