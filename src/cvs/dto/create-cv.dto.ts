import { Type } from "class-transformer";
import {
    IsString,
    Length,
    Min,
    IsOptional,
    IsUUID,
    IsInt,
    Max,
    IsArray,
    ValidateNested
} from "class-validator"
import { CreateSkillDto } from "src/skill/dto/create-skill.dto";

export class CreateCvDto {

    @IsString()
    firstName: string; 

    @IsString()
    name: string;
    
    @IsInt()
    @Min(18)
    @Max(90)
    age: number
    
    @IsString()
    Job: string;

    @IsString()
    @Length(8, 8)
    cin: string;

    @IsString()
    @IsOptional()
    path?: string;

    @IsArray()
    skills: { id: string, designation: string }[];
}
