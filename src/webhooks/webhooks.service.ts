import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID } from 'crypto';
import { CvEventName, CvEventPayload } from 'src/cvs/events/cv.events';
import { CvEvents } from '../cvs/events/cv.events';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendCvCreated(cv: CvEventPayload) {
    await this.sendEvent(CvEvents.Created, cv);
  }

  async sendCvUpdated(cv: CvEventPayload) {
    await this.sendEvent(CvEvents.Updated, cv);
  }

  async sendCvDeleted(cv: CvEventPayload) {
    await this.sendEvent(CvEvents.Deleted, cv);
  }

  private async sendEvent(event: CvEventName, data: unknown) {
    const url = this.configService.get<string>('WEBHOOK_URL');
    if (!url) return;

    const deliveryId = randomUUID();
    const timestamp = new Date().toISOString();
    const body = JSON.stringify({
      event,
      timestamp,
      deliveryId,
      data,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CvTech-Event': event,
      'X-CvTech-Delivery': deliveryId,
      'X-CvTech-Timestamp': timestamp,
    };

    const secret = this.configService.get<string>('WEBHOOK_SECRET');
    if (secret) {
      const signature = createHmac('sha256', secret).update(body).digest('hex');
      headers['X-CvTech-Signature'] = `sha256=${signature}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        this.logger.warn(
          `Webhook failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Webhook error: ${message}`);
    }
  }
}
