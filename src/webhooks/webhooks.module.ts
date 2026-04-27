import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksListener } from './webhooks.listener';

@Module({
  providers: [WebhooksService, WebhooksListener],
  exports: [WebhooksService],
})
export class WebhooksModule {}
