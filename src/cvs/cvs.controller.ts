import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';

@Roles('ADMIN', 'USER')
@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @Post()
  create(@Req() req: Request, @Body() createCvDto: CreateCvDto) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.create(createCvDto, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user;
    const userId = user?.userId;
    const role = user?.role;
    if (!userId) throw new UnauthorizedException();
    if (role === 'ADMIN') return this.cvsService.findAll();
    return this.cvsService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user;
    const userId = user?.userId;
    const role = user?.role;
    if (!userId) throw new UnauthorizedException();

    const cv = await this.cvsService.findOne(id);
    if (role !== 'ADMIN' && cv.userId !== userId) {
      throw new ForbiddenException('You can only view your own CVs');
    }
    return cv;
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    const user = req.user;
    const userId = user?.userId;
    const role = user?.role;
    if (!userId) throw new UnauthorizedException();

    const cv = await this.cvsService.findOne(id);
    if (role !== 'ADMIN' && cv.userId !== userId) {
      throw new ForbiddenException('You can only update your own CVs');
    }
    return this.cvsService.update(id, updateCvDto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user;
    const userId = user?.userId;
    const role = user?.role;
    if (!userId) throw new UnauthorizedException();

    const cv = await this.cvsService.findOne(id);
    if (role !== 'ADMIN' && cv.userId !== userId) {
      throw new ForbiddenException('You can only delete your own CVs');
    }
    return this.cvsService.remove(id);
  }
}