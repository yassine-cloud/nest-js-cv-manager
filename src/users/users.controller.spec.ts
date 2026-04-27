import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],

      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],

    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call usersService.create', async () => {
    const dto: CreateUserDto = {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'USER',
    };
    const createdUser = { id: 'user-1', ...dto };
    mockUsersService.create.mockResolvedValue(createdUser);

    const result = await controller.create(dto);

    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(createdUser);
  });

  it('findAll should call usersService.findAll', async () => {
    const users = [{ id: 'user-1', username: 'john_doe' }];
    mockUsersService.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(mockUsersService.findAll).toHaveBeenCalledWith();
    expect(result).toEqual(users);
  });

  it('findOne should call usersService.findOne with id', async () => {
    const id = 'user-1';
    const user = { id, username: 'john_doe' };
    mockUsersService.findOne.mockResolvedValue(user);

    const result = await controller.findOne(id);

    expect(mockUsersService.findOne).toHaveBeenCalledWith(id);
    expect(result).toEqual(user);
  });

  it('update should call usersService.update with id and dto', async () => {
    const id = 'user-1';
    const dto: UpdateUserDto = { role: 'ADMIN' };
    const updatedUser = { id, username: 'john_doe', role: 'ADMIN' };
    mockUsersService.update.mockResolvedValue(updatedUser);

    const result = await controller.update(id, dto);

    expect(mockUsersService.update).toHaveBeenCalledWith(id, dto);
    expect(result).toEqual(updatedUser);
  });

  it('remove should call usersService.remove with id', async () => {
    const id = 'user-1';
    const removedUser = { id };
    mockUsersService.remove.mockResolvedValue(removedUser);

    const result = await controller.remove(id);

    expect(mockUsersService.remove).toHaveBeenCalledWith(id);
    expect(result).toEqual(removedUser);
  });
});
