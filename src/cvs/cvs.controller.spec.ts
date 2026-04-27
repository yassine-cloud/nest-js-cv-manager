import { Test, TestingModule } from '@nestjs/testing';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';


describe('CvsController', () => {
  let controller: CvsController;
  let mockCvsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findAllByUser: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockCvsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllByUser: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvsController],

      providers: [
        {
          provide: CvsService,
          useValue: mockCvsService,
        },
      ],

    }).compile();

    controller = module.get<CvsController>(CvsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create', async () => {
    const req = { user: { userId: 'user-1', role: 'USER' } } as any;
    const dto: CreateCvDto = {
      firstName: 'John',
      name: 'Doe',
      age: 22,
      Job: 'Dev',
      cin: '12345678',
      path: '',
      skills: [{ id: 'skill-1', designation: 'NestJS' }],
    };
    const created = { id: 'cv-1' };
    mockCvsService.create.mockResolvedValue(created);

    const result = await controller.create(req, dto);

    expect(mockCvsService.create).toHaveBeenCalledWith(dto, 'user-1');
    expect(result).toEqual(created);
  });

  it('create should throw UnauthorizedException if no userId', async () => {
    const req = {} as any;
    const dto = {} as CreateCvDto;

    expect(() => controller.create(req, dto)).toThrow(UnauthorizedException);
  });

  it('findAll should pass userId and role to service', async () => {
    const req = { user: { userId: 'admin-1', role: 'ADMIN' } } as any;
    const cvs = [{ id: 'cv-1' }];
    mockCvsService.findAll.mockResolvedValue(cvs);

    const result = await controller.findAll(req);

    expect(mockCvsService.findAll).toHaveBeenCalledWith();
    expect(mockCvsService.findAllByUser).not.toHaveBeenCalled();
    expect(result).toEqual(cvs);
  });

  it('findAll should return only user cvs for USER', async () => {
    const req = { user: { userId: 'user-1', role: 'USER' } } as any;
    const cvs = [{ id: 'cv-1', userId: 'user-1' }];
    mockCvsService.findAllByUser.mockResolvedValue(cvs);

    const result = await controller.findAll(req);

    expect(mockCvsService.findAllByUser).toHaveBeenCalledWith('user-1');
    expect(mockCvsService.findAll).not.toHaveBeenCalled();
    expect(result).toEqual(cvs);
  });

  it('findOne should allow owner user', async () => {
    const req = { user: { userId: 'user-1', role: 'USER' } } as any;
    const cv = { id: 'cv-1', userId: 'user-1' };
    mockCvsService.findOne.mockResolvedValue(cv);

    const result = await controller.findOne(req, 'cv-1');

    expect(mockCvsService.findOne).toHaveBeenCalledWith('cv-1');
    expect(result).toEqual(cv);
  });

  it('findOne should throw ForbiddenException for non-owner user', async () => {
    const req = { user: { userId: 'user-1', role: 'USER' } } as any;
    mockCvsService.findOne.mockResolvedValue({ id: 'cv-1', userId: 'user-2' });

    await expect(controller.findOne(req, 'cv-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('update should call cvsService.update for owner user', async () => {
    const req = { user: { userId: 'user-1', role: 'USER' } } as any;
    const dto: UpdateCvDto = { Job: 'Senior Dev' };
    const updated = { id: 'cv-1' };
    mockCvsService.findOne.mockResolvedValue({ id: 'cv-1', userId: 'user-1' });
    mockCvsService.update.mockResolvedValue(updated);

    const result = await controller.update(req, 'cv-1', dto);

    expect(mockCvsService.findOne).toHaveBeenCalledWith('cv-1');
    expect(mockCvsService.update).toHaveBeenCalledWith('cv-1', dto);
    expect(result).toEqual(updated);
  });

  it('update should allow ADMIN on any cv', async () => {
    const req = { user: { userId: 'admin-1', role: 'ADMIN' } } as any;
    const dto: UpdateCvDto = { Job: 'Admin Updated' };
    const updated = { id: 'cv-1', job: 'Admin Updated' };
    mockCvsService.findOne.mockResolvedValue({ id: 'cv-1', userId: 'user-2' });
    mockCvsService.update.mockResolvedValue(updated);

    const result = await controller.update(req, 'cv-1', dto);

    expect(mockCvsService.update).toHaveBeenCalledWith('cv-1', dto);
    expect(result).toEqual(updated);
  });

  it('update should throw ForbiddenException for non-owner user', async () => {
    const req = { user: { userId: 'user-1', role: 'USER' } } as any;
    mockCvsService.findOne.mockResolvedValue({ id: 'cv-1', userId: 'user-2' });

    await expect(controller.update(req, 'cv-1', {} as UpdateCvDto)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(mockCvsService.update).not.toHaveBeenCalled();
  });

  it('update should throw UnauthorizedException if no userId', async () => {
    const req = {} as any;

    await expect(controller.update(req, 'cv-1', {} as UpdateCvDto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('remove should allow ADMIN to remove any cv', async () => {
    const req = { user: { userId: 'user-1', role: 'ADMIN' } } as any;
    const deleted = { id: 'cv-1' };
    mockCvsService.findOne.mockResolvedValue({ id: 'cv-1', userId: 'user-2' });
    mockCvsService.remove.mockResolvedValue(deleted);

    const result = await controller.remove(req, 'cv-1');

    expect(mockCvsService.findOne).toHaveBeenCalledWith('cv-1');
    expect(mockCvsService.remove).toHaveBeenCalledWith('cv-1');
    expect(result).toEqual(deleted);
  });

  it('remove should throw ForbiddenException for non-owner user', async () => {
    const req = { user: { userId: 'user-1', role: 'USER' } } as any;
    mockCvsService.findOne.mockResolvedValue({ id: 'cv-1', userId: 'user-2' });

    await expect(controller.remove(req, 'cv-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(mockCvsService.remove).not.toHaveBeenCalled();
  });

  it('remove should throw UnauthorizedException if no userId', async () => {
    const req = {} as any;

    await expect(controller.remove(req, 'cv-1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
