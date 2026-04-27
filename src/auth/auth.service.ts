import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { sign } from 'jsonwebtoken';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  private verifyPassword(password: string, stored: string) {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(key, 'hex');
    return timingSafeEqual(derived, expected);
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: 'USER',
    } as any);
    return { id: user.id, username: user.username, email: user.email };
  }

  async validateUser(usernameOrEmail: string, password: string) {
    try {
      // try find by username then email
      const user = await this.usersService.findByNameOrEmail(usernameOrEmail);

      if (!user) return null;
      const ok = this.verifyPassword(password, user.password);
      if (!ok) return null;
      return user;
    } catch (err) {
      // console.error('validateUser error', err);
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.validateUser(dto.usernameOrEmail, dto.password);
      if (!user) throw new UnauthorizedException('Invalid credentials');
      const payload = { userId: user.id, username: user.username, role: user.role };
      const token = sign(payload, process.env.JWT_SECRET ?? 'secret', {
        expiresIn: '1h',
      });
      return { access_token: token };
    } catch (err) {
      // If it's an UnauthorizedException let it bubble up, else log and return 500
      // eslint-disable-next-line no-console
      // console.error('login error', err);
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Login failed');
    }
  }
}
