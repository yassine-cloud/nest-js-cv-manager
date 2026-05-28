import { Module } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';
import { DatabaseModule } from 'src/database/database.module';
import { EventsModule } from '../events/events.module';
import { CvAuditLogListener } from './cv-audit-log.listener';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [CvsController],
  providers: [CvsService, CvAuditLogListener],
})
export class CvsModule {}
