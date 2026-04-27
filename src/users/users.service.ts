import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'generated/prisma/client';
import { randomBytes, scryptSync } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) { }

    private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  async create(createUserDto: Prisma.UserCreateInput) {
    try {
      createUserDto.password = this.hashPassword(createUserDto.password);
      return await this.databaseService.user.create({
        data: createUserDto
      });
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
      return await this.databaseService.user.update({
        where: { id },
        data: updateUserDto
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      throw new BadRequestException('Error updating user');
    }
  }

  async remove(id: string) {
    try {
      return await this.databaseService.user.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      throw new BadRequestException('Error deleting user');
    }
  }
}
