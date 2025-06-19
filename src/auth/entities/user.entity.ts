import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user")
export class User{
     @PrimaryGeneratedColumn('uuid')
     userId:string;

    @Column()
    name:string;

    @Column({ type: 'varchar', length: 500, unique: true })
    email:string;

    @Column()
    password:string;

}