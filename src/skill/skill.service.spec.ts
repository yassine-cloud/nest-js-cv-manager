import { Test, TestingModule } from '@nestjs/testing';
import { SkillService } from './skill.service';
import { DatabaseService } from 'src/database/database.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

describe('SkillService', () => {
  let service: SkillService;
  let mockDatabaseService: {
    skill: {
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
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({

      providers: [
        SkillService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],

    }).compile();

    service = module.get<SkillService>(SkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call databaseService.skill.create', async () => {
    const dto: CreateSkillDto = { designation: 'NestJS' };
    const created = { id: 'skill-1', designation: 'NestJS' };
    mockDatabaseService.skill.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(mockDatabaseService.skill.create).toHaveBeenCalledWith({
      data: { designation: 'NestJS' },
    });
    expect(result).toEqual(created);
  });

  it('findAll should call databaseService.skill.findMany', async () => {
    const skills = [{ id: 'skill-1', designation: 'NestJS' }];
    mockDatabaseService.skill.findMany.mockResolvedValue(skills);

    const result = await service.findAll();

    expect(mockDatabaseService.skill.findMany).toHaveBeenCalledWith();
    expect(result).toEqual(skills);
  });

  it('findOne should call databaseService.skill.findUnique with id', async () => {
    const skill = { id: 'skill-1', designation: 'NestJS' };
    mockDatabaseService.skill.findUnique.mockResolvedValue(skill);

    const result = await service.findOne('skill-1');

    expect(mockDatabaseService.skill.findUnique).toHaveBeenCalledWith({
      where: { id: 'skill-1' },
    });
    expect(result).toEqual(skill);
  });

  it('update should call databaseService.skill.update with id and data', async () => {
    const dto: UpdateSkillDto = { designation: 'Prisma' };
    const updated = { id: 'skill-1', designation: 'Prisma' };
    mockDatabaseService.skill.update.mockResolvedValue(updated);

    const result = await service.update('skill-1', dto);

    expect(mockDatabaseService.skill.update).toHaveBeenCalledWith({
      where: { id: 'skill-1' },
      data: dto,
    });
    expect(result).toEqual(updated);
  });

  it('remove should call databaseService.skill.delete with id', async () => {
    const deleted = { id: 'skill-1' };
    mockDatabaseService.skill.delete.mockResolvedValue(deleted);

    const result = await service.remove('skill-1');

    expect(mockDatabaseService.skill.delete).toHaveBeenCalledWith({
      where: { id: 'skill-1' },
    });
    expect(result).toEqual(deleted);
  });
});
