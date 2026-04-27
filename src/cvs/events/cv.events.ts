import { User, skill } from "generated/prisma/client";

export const CvEvents = {
  Created: 'cv.created',
  Updated: 'cv.updated',
  Deleted: 'cv.deleted',
} as const;

export type CvEventName = (typeof CvEvents)[keyof typeof CvEvents];

export interface CvEventPayload {
  id: string;
  userId: string;
  user: User;
  firstname?: string;
  job?: string;
  skills?: skill[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
