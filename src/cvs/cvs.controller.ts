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

  // BEFORE: @Post(':userId') with userId from URL → insecure
  // AFTER:  @Post() with userId from token → secure
  @Post()
  create(@Req() req: Request, @Body() createCvDto: CreateCvDto) {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.create(createCvDto, userId);
  }

  @Get()
  findAll() {
    return this.cvsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvsService.findOne(id);
  }

  // update now receives userId to check ownership
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.update(id, updateCvDto, userId);
  }

  // delete now receives userId to check ownership
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.remove(id, userId);
  }
}