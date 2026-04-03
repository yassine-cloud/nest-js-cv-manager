import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CvsModule } from './cvs/cvs.module';
import { SkillModule } from './skill/skill.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CvsController } from './cvs/cvs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    CvsModule,
    SkillModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// NestModule tells NestJS this module has middleware
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)       // use this middleware
      .forRoutes(CvsController);   // only on CV routes
  }
}