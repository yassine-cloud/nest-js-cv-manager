import { Test, TestingModule } from '@nestjs/testing';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

describe('SkillController', () => {
  let controller: SkillController;
  let mockSkillService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockSkillService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillController],

      providers: [
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
      ],

    }).compile();

    controller = module.get<SkillController>(SkillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call skillService.create', async () => {
    const dto: CreateSkillDto = { designation: 'NestJS' };
    const created = { id: 'skill-1', designation: 'NestJS' };
    mockSkillService.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(mockSkillService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('findAll should call skillService.findAll', async () => {
    const skills = [{ id: 'skill-1', designation: 'NestJS' }];
    mockSkillService.findAll.mockResolvedValue(skills);

    const result = await controller.findAll();

    expect(mockSkillService.findAll).toHaveBeenCalledWith();
    expect(result).toEqual(skills);
  });

  it('findOne should call skillService.findOne with id', async () => {
    const skill = { id: 'skill-1', designation: 'NestJS' };
    mockSkillService.findOne.mockResolvedValue(skill);

    const result = await controller.findOne('skill-1');

    expect(mockSkillService.findOne).toHaveBeenCalledWith('skill-1');
    expect(result).toEqual(skill);
  });

  it('update should call skillService.update with id and dto', async () => {
    const dto: UpdateSkillDto = { designation: 'Prisma' };
    const updated = { id: 'skill-1', designation: 'Prisma' };
    mockSkillService.update.mockResolvedValue(updated);

    const result = await controller.update('skill-1', dto);

    expect(mockSkillService.update).toHaveBeenCalledWith('skill-1', dto);
    expect(result).toEqual(updated);
  });

  it('remove should call skillService.remove with id', async () => {
    const deleted = { id: 'skill-1' };
    mockSkillService.remove.mockResolvedValue(deleted);

    const result = await controller.remove('skill-1');

    expect(mockSkillService.remove).toHaveBeenCalledWith('skill-1');
    expect(result).toEqual(deleted);
  });
});
