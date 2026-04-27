import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}
  
  async create(createUserDto: Prisma.UserCreateInput) {
    try {
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
