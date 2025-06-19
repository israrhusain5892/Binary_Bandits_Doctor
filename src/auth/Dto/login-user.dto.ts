import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class loginUserDto{
    @IsString({message:"email should be in string"})
    @IsNotEmpty({message:"email is required !!"})
    @IsEmail({},{message:"email should be in correct format"})
    email:string;
    
    @IsString({message:"password should be in string fromat"})
    @IsNotEmpty({message:"passsword is required!!"})
    @MinLength(8,{message:"Password must be at least 8 character"})
    password:string;
}