import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../enums/role.enum";
import { Patient } from "./patient.entity";
import { Doctor } from "./doctor.entity";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', length: 500, unique: true })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER

    })
    role: Role;

    @OneToOne(() => Patient, (patient) => patient.user)
    patient: Patient;

    @OneToOne(() => Doctor, (doctor) => doctor.user)
    doctor: Doctor;




}