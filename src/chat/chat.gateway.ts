import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import * as jwt from 'jsonwebtoken';

interface AuthSocket extends Socket {
  userId: string;
  username: string;
  role: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track online users: userId -> { username, socketId }
  private onlineUsers = new Map<string, { username: string; socketId: string }>();

  constructor(private chatService: ChatService) {}

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      const payload: any = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');
      client.userId = payload.userId;
      client.username = payload.username;
      client.role = payload.role;

      this.onlineUsers.set(client.userId, {
        username: client.username,
        socketId: client.id,
      });

      // Broadcast updated online list to everyone
      this.server.emit('online_users', this.getOnlineList());
      client.emit('connected', { message: `Welcome ${client.username}!` });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.userId) {
      this.onlineUsers.delete(client.userId);
      this.server.emit('online_users', this.getOnlineList());
    }
  }

  private getOnlineList() {
    return Array.from(this.onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      username: data.username,
    }));
  }

  // Join a room
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { roomName: string },
  ) {
    const room = await this.chatService.getOrCreateRoom(data.roomName);
    client.join(room.id);
    const messages = await this.chatService.getRoomMessages(room.id);

    client.emit('room_joined', { room, messages });
    client.to(room.id).emit('user_joined', {
      username: client.username,
      roomId: room.id,
    });
  }

  // Leave a room
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    client.to(data.roomId).emit('user_left', { username: client.username });
  }

  // Send a message
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    if (!data.content?.trim()) return;

    const message = await this.chatService.createMessage(
      data.content,
      data.roomId,
      client.userId,
    );

    // Send to everyone in the room including sender
    this.server.to(data.roomId).emit('new_message', message);
  }

  // React to a message with an emoji
  @SubscribeMessage('react')
  async handleReaction(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { messageId: string; emoji: string; roomId: string },
  ) {
    const result = await this.chatService.toggleReaction(
      data.messageId,
      client.userId,
      data.emoji,
    );

    // Broadcast reaction update to everyone in the room
    this.server.to(data.roomId).emit('reaction_updated', {
      messageId: data.messageId,
      ...result,
    });
  }

  // Typing indicator
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    client.to(data.roomId).emit('user_typing', {
      userId: client.userId,
      username: client.username,
      isTyping: data.isTyping,
    });
  }

  // Delete a message (own message or admin)
  @SubscribeMessage('delete_message')
  async handleDelete(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { messageId: string; roomId: string },
  ) {
    // Fetch message to check ownership
    const db = (this.chatService as any).db;
    const msg = await db.message.findUnique({ where: { id: data.messageId } });

    if (!msg) return;
    if (msg.userId !== client.userId && client.role !== 'ADMIN') return;

    await this.chatService.deleteMessage(data.messageId);

    this.server.to(data.roomId).emit('message_deleted', {
      messageId: data.messageId,
    });
  }
}