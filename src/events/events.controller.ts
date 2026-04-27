import { Controller, Sse, Req, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('stream') // l route hetha raw sse endpoint  
  @UseGuards(JwtAuthGuard)
  stream(@Req() req): Observable<any> { // il stream maaneha ki connecti il client runni  
    const userId = req.user.userId; // user.userId instead of id based on JwtStrategy / auth controller
    const role = req.user.role; // Extract role too

    const client$ = this.eventsService.addClient(userId, role);

    req.on('close', () => {
      this.eventsService.removeClient(userId);
    });

    return client$.asObservable();
  }
}