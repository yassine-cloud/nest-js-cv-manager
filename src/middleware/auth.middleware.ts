import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {

    const token = req.headers['auth-user'] as string;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    let decoded: { userId: string };

    try {
      decoded = verify(
        token,
        process.env.JWT_SECRET ?? 'secret',
      ) as { userId: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!decoded.userId) {
      throw new UnauthorizedException('Token does not contain userId');
    }

    req.userId = decoded.userId;
    next();
  }
}
