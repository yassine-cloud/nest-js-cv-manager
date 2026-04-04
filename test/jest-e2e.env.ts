process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./test/test.db';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'secret';
process.env.NODE_ENV = 'test';
process.env.admin_username = process.env.admin_username ?? 'admin';
process.env.admin_email = process.env.admin_email ?? 'admin@email.com';
process.env.admin_password = process.env.admin_password ?? 'admin123';