
import {
    IsString,
    IsOptional,
    IsEmail,
    MaxLength,
    MinLength,
    IsIn
} from "class-validator"


export class CreateUserDto {

 
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsOptional()
  @IsString()
  @IsIn(["USER", "ADMIN"])
  role?: string;
    
   
}
