import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CvsService {
  constructor(private databaseService: DatabaseService) { }

  async create(createCvDto: CreateCvDto, userId: string) {
    const skills = await Promise.all(createCvDto.skills.map(async (skill) => {
      if (skill.id) return { id: skill.id };
      const newskill = await this.databaseService.skill.create({
        data: { designation: skill.designation },
      });
      return { id: newskill.id };
    }));

    const data: any = {
      firstname: createCvDto.firstName,
      age: createCvDto.age,
      job: createCvDto.Job,
      userId,
      cin: createCvDto.cin,
      skills: { connect: skills },
      path: createCvDto.path ?? '',
    };

    const cv = await this.databaseService.cv.create({
      data,
      include: { skills: true, user: true },
    });
    return cv;
  }

  async findAll() {
    const cvs = await this.databaseService.cv.findMany({
      include: { skills: true, user: true },
    });
    return cvs;
  }

  async findOne(id: string) {
    const cv = this.databaseService.cv.findUnique({
      where: { id },
      include: { skills: true, user: true },
    });
    return cv;
  }

  async update(id: string, updateCvDto: UpdateCvDto) {
    const { Job, skills, ...rest } = updateCvDto as any;
    const data: any = { ...rest };

    if (Job !== undefined) {
      data.job = Job;
    }

    if (skills) {
      const skillsToConnect = await Promise.all(skills.map(async (s: { id?: string; designation?: string }) => {
        if (s.id) return { id: s.id };
        const created = await this.databaseService.skill.create({
          data: { designation: s.designation ?? '' },
        });
        return { id: created.id };
      }));
      data.skills = { set: [], connect: skillsToConnect };
    }

    const res = await this.databaseService.cv.update({
      where: { id },
      data,
      include: { skills: true, user: true },
    })
    return res;
  }

  async remove(id: string) {
    const res = await this.databaseService.cv.delete({
      where: { id },
    });
    return res;
  }
}
