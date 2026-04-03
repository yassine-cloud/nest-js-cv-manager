import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Cv (e2e)', () => {
  jest.setTimeout(20000);

  let app: INestApplication<App>;
  let userId: string;
  let skillId: string;
  let cvId: string;
  const extraSkillIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'e2e-user', email: 'e2e-user@example.com', password: 'secret' })
      .expect(201);
    userId = userRes.body.id;

    const skillRes = await request(app.getHttpServer())
      .post('/skill')
      .send({ designation: 'e2e-existing-skill' })
      .expect(201);
    skillId = skillRes.body.id;
  });

  afterAll(async () => {
    if (cvId) await request(app.getHttpServer()).delete(`/cvs/${cvId}`);
    for (const id of extraSkillIds) {
      await request(app.getHttpServer()).delete(`/skill/${id}`);
    }
    if (skillId) await request(app.getHttpServer()).delete(`/skill/${skillId}`);
    if (userId) await request(app.getHttpServer()).delete(`/users/${userId}`);
    await app.close();
  });

  it('POST /cvs/:userId -> create (connect + create skills)', async () => {
    const payload = {
      firstName: 'E2E',
      name: 'Tester',
      age: 30,
      Job: 'Developer',
      cin: '12345678',
      skills: [
        { id: skillId },
        { designation: 'e2e-new-skill' }
      ]
    };

    const res = await request(app.getHttpServer()).post(`/cvs/${userId}`).send(payload).expect(201);
    expect(res.body).toHaveProperty('id');
    expect(Array.isArray(res.body.skills)).toBeTruthy();
    expect(res.body.user).toBeDefined();
    cvId = res.body.id;
  });

  it('GET /cvs -> list includes created', async () => {
    const res = await request(app.getHttpServer()).get('/cvs').expect(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.find((c: any) => c.id === cvId)).toBeDefined();
  });

  it('GET /cvs/:id -> findOne', async () => {
    const res = await request(app.getHttpServer()).get(`/cvs/${cvId}`).expect(200);
    expect(res.body.id).toBe(cvId);
  });

  it('PATCH /cvs/:id -> update (replace skills)', async () => {
    const newSkillRes = await request(app.getHttpServer())
      .post('/skill')
      .send({ designation: 'e2e-replacement-skill' })
      .expect(201);
    const replaceSkillId = newSkillRes.body.id;
    extraSkillIds.push(replaceSkillId);

    const updatePayload = {
      Job: 'Senior Developer',
      skills: [{ id: replaceSkillId }]
    };

    const res = await request(app.getHttpServer()).patch(`/cvs/${cvId}`).send(updatePayload).expect(200);
    expect(res.body.job).toBe('Senior Developer');
    expect(Array.isArray(res.body.skills)).toBeTruthy();
    expect(res.body.skills.length).toBe(1);
  });

  it('DELETE /cvs/:id -> remove', async () => {
    const res = await request(app.getHttpServer()).delete(`/cvs/${cvId}`).expect(200);
    expect(res.body.id).toBe(cvId);
    cvId = undefined as any;
  });
});
