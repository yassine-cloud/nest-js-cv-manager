import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export default async function globalSetup() {
  const databaseUrl = 'file:./test/test.db';
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: process.env.JWT_SECRET ?? 'secret',
    NODE_ENV: 'test',
  } as NodeJS.ProcessEnv;

  const dbPath = join(process.cwd(), 'test', 'test.db');
  if (existsSync(dbPath)) {
    rmSync(dbPath);
  }

  execSync('npx prisma generate', {
    stdio: 'inherit',
    env,
  });

  execSync('npx prisma migrate reset --force', {
    stdio: 'inherit',
    env,
  });

  execSync('npm run seed:cvs', {
    stdio: 'inherit',
    env,
  });
}
