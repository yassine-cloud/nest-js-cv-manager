import { Test, TestingModule } from '@nestjs/testing';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { DatabaseService } from 'src/database/database.service';



describe('SkillController', () => {
  let controller: SkillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillController],
      providers: [SkillService],
    }).compile();

    controller = module.get<SkillController>(SkillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
