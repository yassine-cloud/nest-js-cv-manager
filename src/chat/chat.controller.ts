import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Roles } from 'src/auth/roles.decorator';
import { Request } from 'express';

@Roles('ADMIN', 'USER')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('rooms')
  getRooms() {
    return this.chatService.getRooms();
  }

  @Get('rooms/:roomId/messages')
  getMessages(@Req() req: Request, @Param('roomId') roomId: string) {
    if (!req.user?.userId) throw new UnauthorizedException();
    return this.chatService.getRoomMessages(roomId);
  }
}