import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { AppEvent, SSE } from './events.type';

@Injectable()
export class SseListener {
    private readonly logger = new Logger(SseListener.name);

    constructor(private readonly eventsService: EventsService) {}

    // listen for any SSE.* namespaced events and forward them
    @OnEvent('SSE.*')
    handleAllEvents(payload: any) {
        try {
            this.eventsService.emitEvent(payload as AppEvent);
        } catch (err) {
            this.logger.warn('Failed to forward SSE event: ' + (err as Error).message);
        }
    }
}
