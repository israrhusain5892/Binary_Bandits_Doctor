import { Column } from "typeorm";
import { Type } from 'class-transformer';
import { IS_OPTIONAL, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../enums/role.enum";
import { defaultMaxListeners } from "stream";

export class registerUserDto{
    
        @IsString()
        @IsNotEmpty({message:"name is required !!"})
        name:string;
    
        @IsString({message:"email should be in string"})
        @IsNotEmpty({message:"Email is required !!"})
        @IsEmail({},{message:"email required in correct fromat"}) 
        email: string;
        
        @IsString()
        @IsOptional()
        avatarUrl:string;
        
        @IsString({ message: 'Password must be text' }) 
        @IsNotEmpty({message:"password is required!!"})
        @MinLength(8, {
         message: `Password must be at least 8 characters, but actual is $value` })
         password:string;

         @IsOptional()
         role:Role;
       
}