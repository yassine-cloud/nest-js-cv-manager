import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvEvents, CvEventPayload } from 'src/cvs/events/cv.events';
import { WebhooksService } from './webhooks.service';

@Injectable()
export class WebhooksListener {
    constructor(private readonly webhooksService: WebhooksService) { }

    @OnEvent(CvEvents.Created)
    async handleCvCreated(payload: CvEventPayload) {
        await this.webhooksService.sendCvCreated(payload);
    }

    @OnEvent(CvEvents.Updated)
    async handleCvUpdated(payload: CvEventPayload) {
        await this.webhooksService.sendCvUpdated(payload);
    }

    @OnEvent(CvEvents.Deleted)
    async handleCvDeleted(payload: CvEventPayload) {
        await this.webhooksService.sendCvDeleted(payload);
    }
}
