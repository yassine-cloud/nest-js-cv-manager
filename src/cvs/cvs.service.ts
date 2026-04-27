import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { DatabaseService } from 'src/database/database.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class CvsService {
  constructor(
    private databaseService: DatabaseService,
    private eventsService: EventsService,
  ) {}

  async create(createCvDto: CreateCvDto, userId: string) {

    const skills = await Promise.all(
      createCvDto.skills.map(async (skill) => {
        if (skill.id) return { id: skill.id };
        const newskill = await this.databaseService.skill.create({
          data: { designation: skill.designation },
        });
        return { id: newskill.id };
      }),
    );

    const result = await this.databaseService.cv.create({
      data: {
        firstname: createCvDto.firstName,
        age: createCvDto.age,
        job: createCvDto.Job,
        userId,          // ← from JWT token, not URL
        cin: '997884451',
        skills: { connect: skills },
        path: createCvDto.path ?? '',
      },
      include: { skills: true, user: true },
    });

    this.eventsService.emitEvent({
      type: 'CV_CREATED',
      entityId: result.id,
      ownerId: result.userId,
      data: result,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async findAll() {
    return this.databaseService.cv.findMany({ include: { skills: true, user: true } });
  }

  async findAllByUser(userId: string) {
    return this.databaseService.cv.findMany({ where: { userId }, include: { skills: true, user: true } });
  }

  async findOne(id: string) {
    const cv = await this.databaseService.cv.findUnique({ where: { id }, include: { skills: true, user: true } });
    if (!cv) throw new NotFoundException('CV not found');
    return cv;
  }

  async update(id: string, updateCvDto: UpdateCvDto) {
    const cv = await this.databaseService.cv.findUnique({ where: { id } });
    if (!cv) throw new NotFoundException('CV not found');

    const { Job, skills, ...rest } = updateCvDto as any;
    const data: any = { ...rest };
    if (Job !== undefined) data.job = Job;

    if (skills) {
      const skillsToConnect = await Promise.all(
        skills.map(async (s: { id?: string; designation?: string }) => {
          if (s.id) return { id: s.id };
          const created = await this.databaseService.skill.create({
            data: { designation: s.designation ?? '' },
          });
          return { id: created.id };
        }),
      );
      data.skills = { set: [], connect: skillsToConnect };
    }

    const result = await this.databaseService.cv.update({
      where: { id },
      data,
      include: { skills: true, user: true },
    });

    this.eventsService.emitEvent({
      type: 'CV_UPDATED',
      entityId: result.id,
      ownerId: result.userId,
      data: result,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async remove(id: string) {
    const cv = await this.databaseService.cv.findUnique({ where: { id } });
    if (!cv) throw new NotFoundException('CV not found');

    const result = await this.databaseService.cv.delete({ where: { id } });

    this.eventsService.emitEvent({
      type: 'CV_DELETED',
      entityId: result.id,
      ownerId: result.userId,
      data: result,
      timestamp: new Date().toISOString(),
    });

    return result;
  }
}