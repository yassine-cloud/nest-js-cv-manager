import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService], // mohem  bich  nista3mlouh fil modules lokhrin
})
export class EventsModule {}