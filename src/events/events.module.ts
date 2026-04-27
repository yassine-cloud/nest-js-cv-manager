import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { SseListener } from './sse.listener';

@Module({
  controllers: [EventsController],
  providers: [EventsService, SseListener],
  exports: [EventsService], // mohem  bich  nista3mlouh fil modules lokhrin
})
export class EventsModule {}