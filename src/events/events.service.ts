import { Injectable, MessageEvent } from '@nestjs/common';

import { Subject } from 'rxjs';
import { AppEvent } from './events.type';

@Injectable()
export class EventsService {
  // Store subject and role mapped by user ID
  private ObjectClients = new Map<string, { subject: Subject<MessageEvent>, role: string }>();

  addClient(userId: string, role: string) {
    const subject = new Subject<MessageEvent>();
    this.ObjectClients.set(userId, { subject, role });
    // console.log(`Client added: ${userId} with role ${role}`);
    return subject;
  }

  removeClient(userId: string) {
    const clientData = this.ObjectClients.get(userId);
    if (clientData) {
      clientData.subject.complete();
      this.ObjectClients.delete(userId);
      // console.log(`Client removed: ${userId}`);
    }
  }

  emitEvent(event: AppEvent) {
    for (const [userId, clientData] of this.ObjectClients.entries()) {
      // console.log(`Emitting event to user ${userId} with role ${clientData.role}: ${event.type}`);
      
      // The admin can visualize everything
      if (clientData.role === 'ADMIN') {
        clientData.subject.next({ data: JSON.stringify(event) });
        // console.log(`Admin user ${userId} received event: ${event.type}`);
        continue;
      }

      // A connected user is only notified for CVs they created
      if (event.ownerId && event.ownerId === userId) {
        clientData.subject.next({ data: JSON.stringify(event) });
        // console.log(`User ${userId} received event: ${event.type}`);
      }
    }
  }
}

