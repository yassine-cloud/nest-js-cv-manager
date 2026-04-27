import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { DatabaseService } from 'src/database/database.service';
import { CvEvents, CvEventPayload } from './events/cv.events';
import { AppEvent, SSE } from 'src/events/events.type';

@Injectable()
export class CvsService {
  constructor(
    private databaseService: DatabaseService,
    private eventEmitter: EventEmitter2,
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

    const createdCv = await this.databaseService.cv.create({
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

    const createdEvent: CvEventPayload = {
      id: createdCv.id,
      userId: createdCv.userId,
      user: createdCv.user,
      firstname: createdCv.firstname ?? undefined,
      job: createdCv.job ?? undefined,
      skills: createdCv.skills ?? undefined,
      createdAt: createdCv.createdAt ?? undefined,
    };
    const SSE_createdEvent : AppEvent = {
      type: SSE.CV_CREATED,
      entityId: createdCv.id,
      ownerId: createdCv.userId,
      data: createdCv,
      timestamp: new Date().toISOString(),
    };
    this.eventEmitter.emit(CvEvents.Created, createdEvent);
    this.eventEmitter.emit(SSE.CV_CREATED, SSE_createdEvent);
    return createdCv;
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

    const updatedCv = await this.databaseService.cv.update({
      where: { id },
      data,
      include: { skills: true, user: true },
    });

    const updatedEvent: CvEventPayload = {
      id: updatedCv.id,
      userId: updatedCv.userId,
      user: updatedCv.user,
      firstname: updatedCv.firstname ?? undefined,
      job: updatedCv.job ?? undefined,
      skills: updatedCv.skills ?? undefined,
      updatedAt: updatedCv.updatedAt ?? undefined,
    };

    const SSE_updatedEvent : AppEvent = {
      type: SSE.CV_UPDATED,
      entityId: updatedCv.id,
      ownerId: updatedCv.userId,
      data: updatedCv,
      timestamp: new Date().toISOString(),
    };

    this.eventEmitter.emit(CvEvents.Updated, updatedEvent);
    this.eventEmitter.emit(SSE.CV_UPDATED, SSE_updatedEvent);
    return updatedCv;
  }

  async remove(id: string) {
    const cv = await this.databaseService.cv.findUnique({ where: { id } });
    if (!cv) throw new NotFoundException('CV not found');

    const deletedCv = await this.databaseService.cv.delete({ where: { id }, include: { skills: true, user: true } });

    const deletedEvent: CvEventPayload = {
      id: deletedCv.id,
      userId: deletedCv.userId,
      user: deletedCv.user,
      firstname: deletedCv.firstname ?? undefined,
      job: deletedCv.job ?? undefined,
      skills: deletedCv.skills ?? undefined,
      deletedAt: new Date(),
    };

    const SSE_deletedEvent : AppEvent = {
      type: SSE.CV_DELETED,
      entityId: deletedCv.id,
      ownerId: deletedCv.userId,
      data: deletedCv,
      timestamp: new Date().toISOString(),
    };

    this.eventEmitter.emit(CvEvents.Deleted, deletedEvent);
    this.eventEmitter.emit(SSE.CV_DELETED, SSE_deletedEvent);
    return deletedCv;
  }
}