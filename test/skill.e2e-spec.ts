import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Skill (e2e)', () => {
  let app: INestApplication<App>;
  let createdId: string;
  let userId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'skill-e2e-user',
        email: 'skill-e2e-user@example.com',
        password: 'secret123',
      })
      .expect(201);
    userId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usernameOrEmail: 'skill-e2e-user', password: 'secret123' })
      .expect(201);
    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    if (createdId) {
      await request(app.getHttpServer())
        .delete(`/skill/${createdId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (userId) {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  it('POST /skill -> create', async () => {
    const res = await request(app.getHttpServer())
      .post('/skill')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ designation: 'e2e-skill' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.designation).toBe('e2e-skill');
    createdId = res.body.id;
  });

  it('GET /skill -> findAll includes created', async () => {
    const res = await request(app.getHttpServer())
      .get('/skill')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.find((s: any) => s.id === createdId)).toBeDefined();
  });

  it('GET /skill/:id -> findOne', async () => {
    const res = await request(app.getHttpServer())
      .get(`/skill/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.id).toBe(createdId);
  });

  it('PATCH /skill/:id -> update', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/skill/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ designation: 'e2e-skill-updated' })
      .expect(200);

    expect(res.body.designation).toBe('e2e-skill-updated');
  });

  it('DELETE /skill/:id -> remove', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/skill/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.id).toBe(createdId);
    createdId = undefined as any;
  });
});
