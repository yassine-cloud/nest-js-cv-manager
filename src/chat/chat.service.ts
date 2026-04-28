import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChatService {
  constructor(private db: DatabaseService) {}

  async getOrCreateRoom(name: string) {
    return this.db.room.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async getRooms() {
    return this.db.room.findMany({
      include: { _count: { select: { messages: true } } },
    });
  }

  async getRoomMessages(roomId: string) {
    return this.db.message.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, username: true } },
        reactions: {
          include: { user: { select: { id: true, username: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(content: string, roomId: string, userId: string) {
    return this.db.message.create({
      data: { content, roomId, userId },
      include: {
        user: { select: { id: true, username: true } },
        reactions: true,
      },
    });
  }

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    const existing = await this.db.reaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    });

    if (existing) {
      await this.db.reaction.delete({ where: { id: existing.id } });
      return { removed: true, emoji, messageId, userId };
    }

    const reaction = await this.db.reaction.create({
      data: { messageId, userId, emoji },
      include: { user: { select: { id: true, username: true } } },
    });
    return { removed: false, reaction };
  }

 async deleteMessage(messageId: string) {
  await this.db.reaction.deleteMany({ where: { messageId } });
  return this.db.message.delete({ where: { id: messageId } });
}
}