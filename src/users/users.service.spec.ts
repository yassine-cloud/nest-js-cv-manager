import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'generated/prisma/client';


describe('UsersService', () => {
  let service: UsersService;
  let mockDatabaseService: {
    user: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockDatabaseService = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({

      providers: [UsersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],

    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create', async () => {
    const createUserDto: Prisma.UserCreateInput = {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'strongPassword123',
      role: 'USER',
    };

    const createdUser = {
      id: 'user-1',
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDatabaseService.user.create.mockResolvedValue(createdUser);

    const result = await service.create(createUserDto);

    expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
      data: createUserDto,
    });
    expect(result).toEqual(createdUser);
  });

  it('findAll', async () => {
    const users = [
      {
        id: 'user-1',
        username: 'john_doe',
        email: 'john@example.com',
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-2',
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockDatabaseService.user.findMany.mockResolvedValue(users);

    const result = await service.findAll();

    expect(mockDatabaseService.user.findMany).toHaveBeenCalledWith();
    expect(result).toEqual(users);
  });

  it('findOne', async () => {
    const id = 'user-1';
    const user = {
      id,
      username: 'john_doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDatabaseService.user.findUnique.mockResolvedValue(user);

    const result = await service.findOne(id);

    expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
    expect(result).toEqual(user);
  });

  it('update', async () => {
    const id = 'user-1';
    const updateUserDto: Prisma.UserUpdateInput = {
      username: 'john_updated',
      role: 'ADMIN',
    };

    const updatedUser = {
      id,
      username: 'john_updated',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDatabaseService.user.update.mockResolvedValue(updatedUser);

    const result = await service.update(id, updateUserDto);

    expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
      where: { id },
      data: updateUserDto,
    });
    expect(result).toEqual(updatedUser);
  });

  it('remove', async () => {
    const id = 'user-1';
    const deletedUser = {
      id,
      username: 'john_doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDatabaseService.user.delete.mockResolvedValue(deletedUser);

    const result = await service.remove(id);

    expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({
      where: { id },
    });
    expect(result).toEqual(deletedUser);
  });
});
