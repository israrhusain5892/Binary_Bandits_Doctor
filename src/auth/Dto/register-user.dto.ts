import { Column } from "typeorm";
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Role } from "../enums/role.enum";

export class registerUserDto{
    
        @IsString()
        @IsNotEmpty({message:"name is required !!"})
        name:string;
    
        @IsString({message:"email should be in string"})
        @IsNotEmpty({message:"Email is required !!"})
        @IsEmail({},{message:"email required in correct fromat"}) 
        email: string;
    
        
        @IsString({ message: 'Password must be text' }) 
        @IsNotEmpty({message:"password is required!!"})
        @MinLength(8, {
         message: `Password must be at least 8 characters, but actual is $value` })
        password:string;

        @IsString({message:"role should be in string"})
        role:Role;
}