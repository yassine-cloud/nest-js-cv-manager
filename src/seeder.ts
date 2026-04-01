import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { CvSeederService } from './commands/cv.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
    const seederService = app.get(CvSeederService);
    await seederService.seed();
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();