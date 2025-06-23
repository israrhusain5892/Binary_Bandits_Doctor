import { Column } from "typeorm";
import { Type } from 'class-transformer';
import { IS_OPTIONAL, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../enums/role.enum";
import { defaultMaxListeners } from "stream";
import { Provider } from "../enums/provider.enum";

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
        
         @IsOptional()
         password:string;

         @IsOptional()
         role:Role;

         @IsOptional()
         provider:Provider;
       
}