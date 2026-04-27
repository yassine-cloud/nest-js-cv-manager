import { Test, TestingModule } from '@nestjs/testing';
import { CvsService } from './cvs.service';
import { DatabaseService } from 'src/database/database.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';


describe('CvsService', () => {
  let service: CvsService;
  let mockDatabaseService: {
    skill: {
      create: jest.Mock;
    };
    cv: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockDatabaseService = {
      skill: {
        create: jest.fn(),
      },
      cv: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({

      providers: [
        CvsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],

    }).compile();

    service = module.get<CvsService>(CvsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should create missing skills and create cv', async () => {
    const userId = 'user-1';
    const dto: CreateCvDto = {
      firstName: 'John',
      name: 'Doe',
      age: 25,
      Job: 'Backend Dev',
      cin: '12345678',
      path: '/tmp/cv.pdf',
      skills: [{ id: 'skill-existing', designation: 'NestJS' }, { id: '', designation: 'Prisma' }],
    };

    mockDatabaseService.skill.create.mockResolvedValue({ id: 'skill-new' });
    const createdCv = { id: 'cv-1' };
    mockDatabaseService.cv.create.mockResolvedValue(createdCv);

    const result = await service.create(dto, userId);

    expect(mockDatabaseService.skill.create).toHaveBeenCalledWith({
      data: { designation: 'Prisma' },
    });
    expect(mockDatabaseService.cv.create).toHaveBeenCalledWith({
      data: {
        firstname: dto.firstName,
        age: dto.age,
        job: dto.Job,
        userId,
        cin: '997884451',
        skills: { connect: [{ id: 'skill-existing' }, { id: 'skill-new' }] },
        path: dto.path,
      },
      include: { skills: true, user: true },
    });
    expect(result).toEqual(createdCv);
  });

  it('findAll should return all cvs for ADMIN', async () => {
    const cvs = [{ id: 'cv-1' }];
    mockDatabaseService.cv.findMany.mockResolvedValue(cvs);

    const result = await service.findAll('user-1', 'ADMIN');

    expect(mockDatabaseService.cv.findMany).toHaveBeenCalledWith({
      include: { skills: true, user: true },
    });
    expect(result).toEqual(cvs);
  });

  it('findAll should return only user cvs for non-admin', async () => {
    const cvs = [{ id: 'cv-1', userId: 'user-1' }];
    mockDatabaseService.cv.findMany.mockResolvedValue(cvs);

    const result = await service.findAll('user-1', 'USER');

    expect(mockDatabaseService.cv.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { skills: true, user: true },
    });
    expect(result).toEqual(cvs);
  });

  it('findOne should return null if cv not found', async () => {
    mockDatabaseService.cv.findUnique.mockResolvedValue(null);

    const result = await service.findOne('cv-1', 'user-1', 'USER');

    expect(result).toBeNull();
  });

  it('findOne should throw ForbiddenException for non-owner', async () => {
    mockDatabaseService.cv.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-2' });

    await expect(service.findOne('cv-1', 'user-1', 'USER')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('update should throw NotFoundException when cv does not exist', async () => {
    mockDatabaseService.cv.findUnique.mockResolvedValue(null);

    await expect(service.update('cv-1', {} as UpdateCvDto, 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update should update cv for owner', async () => {
    const dto: UpdateCvDto = {
      Job: 'Senior Dev',
      skills: [{ id: 'skill-1', designation: 'Node' }],
    };

    mockDatabaseService.cv.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-1' });
    const updatedCv = { id: 'cv-1', job: 'Senior Dev' };
    mockDatabaseService.cv.update.mockResolvedValue(updatedCv);

    const result = await service.update('cv-1', dto, 'user-1');

    expect(mockDatabaseService.cv.update).toHaveBeenCalledWith({
      where: { id: 'cv-1' },
      data: {
        job: 'Senior Dev',
        skills: { set: [], connect: [{ id: 'skill-1' }] },
      },
      include: { skills: true, user: true },
    });
    expect(result).toEqual(updatedCv);
  });

  it('remove should throw ForbiddenException for non-owner', async () => {
    mockDatabaseService.cv.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-2' });

    await expect(service.remove('cv-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('remove should delete cv for owner', async () => {
    mockDatabaseService.cv.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-1' });
    const deletedCv = { id: 'cv-1' };
    mockDatabaseService.cv.delete.mockResolvedValue(deletedCv);

    const result = await service.remove('cv-1', 'user-1');

    expect(mockDatabaseService.cv.delete).toHaveBeenCalledWith({ where: { id: 'cv-1' } });
    expect(result).toEqual(deletedCv);
  });
});
