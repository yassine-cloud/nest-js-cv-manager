import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from 'src/database/database.service';
import { CvEvents, CvEventPayload } from './events/cv.events';

@Injectable()
export class CvAuditLogListener {
  private readonly logger = new Logger(CvAuditLogListener.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @OnEvent(CvEvents.Created)
  async handleCvCreated(payload: CvEventPayload) {
    await this.saveAuditLog('CREATE', payload);
  }

  @OnEvent(CvEvents.Updated)
  async handleCvUpdated(payload: CvEventPayload) {
    await this.saveAuditLog('UPDATE', payload);
  }

  @OnEvent(CvEvents.Deleted)
  async handleCvDeleted(payload: CvEventPayload) {
    await this.saveAuditLog('DELETE', payload);
  }

  private async saveAuditLog(action: 'CREATE' | 'UPDATE' | 'DELETE', payload: CvEventPayload) {
    try {
      const skillsString = payload.skills?.map((s) => s.designation).join(', ') || null;
      
      // The actor defaults to the CV owner if not specified in the event
      const actorId = payload.actorId || payload.userId;

      await this.databaseService.cvAuditLog.create({
        data: {
          cvId: payload.id,
          action,
          firstname: payload.firstname ?? null,
          age: payload.age ?? null,
          job: payload.job ?? null,
          path: payload.path ?? null,
          skills: skillsString,
          userId: actorId,
          cvOwnerId: payload.userId,
        },
      });

      this.logger.log(`Audit log successfully saved: ${action} for CV ID ${payload.id} by User ${actorId}`);
    } catch (error) {
      this.logger.error(
        `Failed to save audit log for ${action} on CV ID ${payload.id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
