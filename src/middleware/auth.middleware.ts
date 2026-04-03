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

    // STEP A: read the 'auth-user' header from the request
    const token = req.headers['auth-user'] as string;

    // STEP B: if no token exists → throw 401
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // STEP C: decode the token using our JWT_SECRET
      // verify() throws an error if token is fake or expired
      const decoded = verify(
        token,
        process.env.JWT_SECRET ?? 'secret',
      ) as { userId: string };

      // STEP D: if token is valid but has no userId → throw 401
      if (!decoded.userId) {
        throw new UnauthorizedException('Token does not contain userId');
      }

      // STEP E: attach userId to the request object
      // now the controller can read req.userId
      req.userId = decoded.userId;

      // STEP F: call next() to continue to the controller
      next();

    } catch {
      // any problem with the token ends here
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}