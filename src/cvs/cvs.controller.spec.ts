import { Test, TestingModule } from '@nestjs/testing';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { DatabaseService } from 'src/database/database.service';
import { beforeEach, describe, it } from 'node:test';

describe('CvsController', () => {
  let controller: CvsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvsController],
      providers: [
        CvsService,
        { provide: DatabaseService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CvsController>(CvsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
