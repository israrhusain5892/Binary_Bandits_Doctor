import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../enums/role.enum";
import { Patient } from "../../patient/entities/patient.entity";
import { Doctor } from "../../doctor/entities/doctor.entity";
import { Provider } from "../enums/provider.enum";
import { Appointment } from "src/doctor/entities/Appointment";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', length: 500, unique: true })
    email: string;

    @Column({ nullable: true, default: null })
    password: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({
        type: 'enum',
        enum: Provider,
        default: Provider.Local
    }
    )
    provider: Provider

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.PATIENT

    })
    role: Role;

    @Column({ nullable: true })
    refresh_Token: string;


    @OneToOne(() => Patient, (patient) => patient.user)
    patient: Patient;

    @OneToOne(() => Doctor, (doctor) => doctor.user)
    doctor: Doctor;

    @OneToMany(() => Appointment, appointment => appointment.patient)
    appointments: Appointment[];




}