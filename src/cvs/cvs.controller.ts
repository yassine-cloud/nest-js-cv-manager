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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  // BEFORE: @Post(':userId') with userId from URL → insecure
  // AFTER:  @Post() with userId from token → secure
  @Post()
  create(@Req() req: Request, @Body() createCvDto: CreateCvDto) {
    const userId = (req as any).user?.userId ?? (req as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.create(createCvDto, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;
    const userId = user?.userId ?? (req as any).userId;
    const role = user?.role;
    return this.cvsService.findAll(userId, role);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user;
    const userId = user?.userId ?? (req as any).userId;
    const role = user?.role;
    return this.cvsService.findOne(id, userId, role);
  }

  // update now receives userId to check ownership
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    const userId = (req as any).user?.userId ?? (req as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.update(id, updateCvDto, userId);
  }

  // delete now receives userId to check ownership
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user?.userId ?? (req as any).userId;
    if (!userId) throw new UnauthorizedException();
    return this.cvsService.remove(id, userId);
  }
}