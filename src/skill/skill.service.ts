import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class SkillService {
  constructor(private databaseService: DatabaseService) { }

  async create(createSkillDto: CreateSkillDto) {
    const skill = await this.databaseService.skill.create({
      data: {
        designation: createSkillDto.designation
      }
    });
    return skill;
  }

  async findAll() {
    return await this.databaseService.skill.findMany();
  }

  async findOne(id: string) {
    const skill = await this.databaseService.skill.findUnique({
      where: {
        id: id
      }
    });

    return skill;
  }

  async update(id: string , updateSkillDto: UpdateSkillDto) {
    const skill =  await this.databaseService.skill.update({
      where : { id } , 
      data : updateSkillDto
    });
    return skill;    

  }

  async remove(id: string ) {
   
    return await this.databaseService.skill.delete({
      where : { id }
    });
  }
}
