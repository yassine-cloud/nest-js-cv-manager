import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Request } from 'express';

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
    return this.cvsService.findAll(userId, role);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user;
    const userId = user?.userId;
    const role = user?.role;
    return this.cvsService.findOne(id, userId, role);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.update(id, updateCvDto, userId);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.remove(id, userId);
  }
}