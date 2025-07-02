import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Doctor } from "./doctor.entity";

@Entity("doctor_availabilities")
export class DoctorAvailability {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column()
    session: string;



    @ManyToOne(() => Doctor, doctor => doctor.availabilities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'doctor_id' })
    doctor: Doctor;

    @Column()
    doctor_id: string;

}