import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Todo : Do the seeding logic here

  console.log(`Seed completed.`);

  await app.close();
}
bootstrap();
