export type EventType =
  | 'CV_CREATED'
  | 'CV_UPDATED'
  | 'CV_DELETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED';

export interface AppEvent {
  type: EventType;
  entityId: string;
  ownerId?: string; // bich tfiltri l clients
  data?: any;
  timestamp: string;
}