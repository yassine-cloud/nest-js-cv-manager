import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'generated/prisma/client';
import { randomBytes, scryptSync } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvent, SSE } from 'src/events/events.type';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService, private eventEmitter: EventEmitter2) { }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  async create(createUserDto: Prisma.UserCreateInput) {
    try {
      createUserDto.password = this.hashPassword(createUserDto.password);
      const user = await this.databaseService.user.create({
        data: createUserDto
      });
      const SSE_userCreatedEvent: AppEvent = {
        type: SSE.USER_CREATED,
        entityId: user.id,
        ownerId: user.id,
        data: user,
        timestamp: new Date().toISOString(),
      };
      this.eventEmitter.emit(SSE.USER_CREATED, SSE_userCreatedEvent);
      return user;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Username or email already exists');
      }

      throw new BadRequestException('Error creating user');
    }
  }

  async findAll() {
    try {
      return await this.databaseService.user.findMany();
    } catch (error) {
      return [];
    }
  }

  async findByNameOrEmail(usernameOrEmail: string) {
    try {
      return await this.databaseService.user.findFirst({
        where: {
          OR: [
            { username: usernameOrEmail },
            { email: usernameOrEmail },
          ],
        },
      });
    } catch (error) {
      return null;
    }
  }

  async findOne(id: string) {
    try {
      return await this.databaseService.user.findUnique({
        where: { id }
      });
    } catch (error) {
      throw new BadRequestException('Error fetching user');
    }
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = this.hashPassword(updateUserDto.password as string);
      }
      const update_user = await this.databaseService.user.update({
        where: { id },
        data: updateUserDto
      });
      const SSE_userUpdatedEvent: AppEvent = {
        type: SSE.USER_UPDATED,
        entityId: update_user.id,
        ownerId: update_user.id,
        data: update_user,
        timestamp: new Date().toISOString(),
      };
      this.eventEmitter.emit(SSE.USER_UPDATED, SSE_userUpdatedEvent);
      return update_user;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      throw new BadRequestException('Error updating user');
    }
  }

  async remove(id: string) {
    try {
      const delted_user = await this.databaseService.user.delete({
        where: { id }
      });
      const SSE_userDeletedEvent: AppEvent = {
        type: SSE.USER_DELETED,
        entityId: delted_user.id,
        ownerId: delted_user.id,
        data: delted_user,
        timestamp: new Date().toISOString(),
      };
      this.eventEmitter.emit(SSE.USER_DELETED, SSE_userDeletedEvent);
      return delted_user;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      throw new BadRequestException('Error deleting user');
    }
  }
}
