export const SSE = {
  CV_CREATED: 'SSE.CV_CREATED',
  CV_UPDATED: 'SSE.CV_UPDATED',
  CV_DELETED: 'SSE.CV_DELETED',
  USER_CREATED: 'SSE.USER_CREATED',
  USER_UPDATED: 'SSE.USER_UPDATED',
  USER_DELETED: 'SSE.USER_DELETED',
} as const;

export type EventType = (typeof SSE)[keyof typeof SSE];



export interface AppEvent {
  type: EventType;
  entityId: string;
  ownerId?: string; // bich tfiltri l clients
  data?: any;
  timestamp: string;
}