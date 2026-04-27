import { Injectable, Logger } from '@nestjs/common';
import {
  randEmail,
  randFilePath,
  randFullName,
  randJobTitle,
  randNumber,
  randPassword,
  randUserName,
} from '@ngneat/falso';
import { randomBytes, scryptSync } from 'crypto';

import { Prisma } from 'generated/prisma/client';
import { DatabaseService } from 'src/database/database.service';

const USERS_COUNT = 20;
const CVS_COUNT = 40;
const LIST_OF_SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'Ruby',
  'Go',
  'PHP',
  'Swift',
  'Kotlin',
  'Rust',
  'Dart',
  'Scala',
  'Perl',
  'Haskell',
  'Elixir',
  'Clojure',
  'F#',
  'Objective-C',
  'SQL',
  'NoSQL',
  'GraphQL',
  'REST',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Linux',
  'Git',
];

function pickRandomIds(ids: string[], amount: number): string[] {
  const pool = [...ids];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = randNumber({ min: 0, max: i });
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(amount, pool.length));
}

@Injectable()
export class CvSeederService {
  private readonly logger = new Logger(CvSeederService.name);

  constructor(private readonly databaseService: DatabaseService) { }

  hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  async seed(): Promise<void> {
    await this.databaseService.$transaction([
      this.databaseService.cv.deleteMany(),
      this.databaseService.user.deleteMany(),
      this.databaseService.skill.deleteMany(),
    ]);


    const adminAccount: Prisma.UserCreateManyInput = {
      username: process.env.admin_username || 'admin',
      email: process.env.admin_email || 'admin@email.com',
      password: process.env.admin_password || 'admin123',
      role: 'ADMIN'
    };

    const usersData: Prisma.UserCreateManyInput[] = Array.from(
      { length: USERS_COUNT },
      (_, index) => ({
        username: `${randUserName({ withAccents: false })}_${index + 1}`,
        email: `user${index + 1}.${randEmail()}`,
        password: randPassword({ size: 12 }),
        role: index === 0 ? 'ADMIN' : 'USER',
      }),
    );

    usersData.unshift(adminAccount);

    // need to hash every password

    for (const user of usersData) {
      user.password = this.hashPassword(user.password);
    }
    await this.databaseService.user.createMany({ data: usersData });
    this.logger.log(`Seeded ${USERS_COUNT} users.`);

    const skillsData: Prisma.skillCreateManyInput[] = LIST_OF_SKILLS.map(
      (designation) => ({ designation }),
    );

    await this.databaseService.skill.createMany({ data: skillsData });
    this.logger.log(`Seeded ${LIST_OF_SKILLS.length} skills.`);

    const [users, skills] = await Promise.all([
      this.databaseService.user.findMany({
        select: { id: true, username: true },
      }),
      this.databaseService.skill.findMany({ select: { id: true } }),
    ]);

    const userIds = users.map((user) => user.id);
    const skillIds = skills.map((skill) => skill.id);

    for (let i = 0; i < CVS_COUNT; i++) {
      const connectedSkills = pickRandomIds(
        skillIds,
        randNumber({ min: 2, max: Math.min(6, skillIds.length) }),
      );

      const randomUserId =
        userIds[randNumber({ min: 0, max: userIds.length - 1 })];

      await this.databaseService.cv.create({
        data: {
          cin: `CIN-${randNumber({ length: 8 })}`,
          firstname:
            users
              .find((u) => u.id === randomUserId)
              ?.username.split('_')[0] || randFullName({ withAccents: false }),
          age: randNumber({ min: 20, max: 60 }),
          job: randJobTitle(),
          path: `https://cv-storage.local/${randFilePath().replace(/\\/g, '/')}.pdf`,
          user: { connect: { id: randomUserId } },
          skills: {
            connect: connectedSkills.map((id) => ({ id })),
          },
        },
      });
    }

    this.logger.log(
      `Seed completed: ${USERS_COUNT} users, ${LIST_OF_SKILLS.length} skills, ${CVS_COUNT} CVs.`,
    );
  }
}
