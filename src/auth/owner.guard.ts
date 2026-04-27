import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const params = request.params || {};
    const id = params['id'] ?? params['userId'] ?? params['user_id'];
    if (!id) {
      throw new ForbiddenException('Missing resource id for ownership check');
    }
    if (id === user.userId) return true;
    throw new ForbiddenException('You do not own this resource');
  }
}
