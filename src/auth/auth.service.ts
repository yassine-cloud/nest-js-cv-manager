import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { sign } from 'jsonwebtoken';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(key, 'hex');
    return timingSafeEqual(derived, expected);
  }

  async register(dto: RegisterDto) {
    const hashed = this.hashPassword(dto.password);
    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: hashed,
      role: 'USER',
    } as any);
    return { id: user.id, username: user.username, email: user.email };
  }

  async validateUser(usernameOrEmail: string, password: string) {
    // try find by username then email
    const users = await this.usersService.findAll();
    const user = users.find(
      (u: any) => u.username === usernameOrEmail || u.email === usernameOrEmail,
    );
    if (!user) return null;
    const ok = this.verifyPassword(password, user.password);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.usernameOrEmail, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { userId: user.id, username: user.username, role: user.role };
    const token = sign(payload, process.env.JWT_SECRET ?? 'secret', {
      expiresIn: '1h',
    });
    return { access_token: token };
  }
}
