import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { sign } from 'jsonwebtoken';

describe('AuthMiddleware (e2e)', () => {
  jest.setTimeout(20000);

  let app: INestApplication<App>;
  let validToken: string;
  let otherUserToken: string;
  let userId: string;
  let otherUserId: string;
  let cvId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        username: 'middleware-user-1',
        email: 'middleware1@test.com',
        password: 'secret123',
      });
    userId = userRes.body.id;

    const otherRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        username: 'middleware-user-2',
        email: 'middleware2@test.com',
        password: 'secret123',
      });
    otherUserId = otherRes.body.id;

    const secret = process.env.JWT_SECRET ?? 'secret';
    validToken = sign({ userId }, secret);
    otherUserToken = sign({ userId: otherUserId }, secret);
  });

  afterAll(async () => {
    if (cvId) {
      await request(app.getHttpServer())
        .delete(`/cvs/${cvId}`)
        .set('auth-user', validToken)
        .set('Authorization', `Bearer ${validToken}`);
    }
    if (userId) {
      await request(app.getHttpServer()).delete(`/users/${userId}`);
    }
    if (otherUserId) {
      await request(app.getHttpServer()).delete(`/users/${otherUserId}`);
    }
    await app.close();
  });

  // ─── TEST 1 ───────────────────────────────────────────────
  it('GET /cvs without token → 401 Unauthorized', async () => {
    await request(app.getHttpServer())
      .get('/cvs')
      .expect(401);
  });

  // ─── TEST 2 ───────────────────────────────────────────────
  it('GET /cvs with invalid token → 401 Unauthorized', async () => {
    await request(app.getHttpServer())
      .get('/cvs')
      .set('auth-user', 'this-is-not-a-valid-token')
      .expect(401);
  });

  // ─── TEST 3 ───────────────────────────────────────────────
  it('GET /cvs with valid token → 200 OK', async () => {
    await request(app.getHttpServer())
      .get('/cvs')
      .set('auth-user', validToken)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });

  // ─── TEST 4 ───────────────────────────────────────────────
  it('POST /cvs with valid token → 201 Created (userId from token)', async () => {
    const res = await request(app.getHttpServer())
      .post('/cvs')
      .set('auth-user', validToken)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        firstName: 'Middleware',
        name: 'Test',
        age: 25,
        Job: 'Engineer',
        cin: '12345678', // ← Added cin here
        path: '',
        skills: [],
      });


    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(userId);
    cvId = res.body.id;
  });

  // ─── TEST 5 ───────────────────────────────────────────────
  it('PATCH /cvs/:id by owner → 200 OK', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/cvs/${cvId}`)
      .set('auth-user', validToken)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ Job: 'Senior Engineer' })
      .expect(200);

    expect(res.body.job).toBe('Senior Engineer');
  });

  // ─── TEST 6 ───────────────────────────────────────────────
  it('PATCH /cvs/:id by stranger → 403 Forbidden', async () => {
    await request(app.getHttpServer())
      .patch(`/cvs/${cvId}`)
      .set('auth-user', otherUserToken)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ Job: 'Hacker' })
      .expect(403);
  });

  // ─── TEST 7 ───────────────────────────────────────────────
  it('DELETE /cvs/:id by stranger → 403 Forbidden', async () => {
    await request(app.getHttpServer())
      .delete(`/cvs/${cvId}`)
      .set('auth-user', otherUserToken)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(403);
  });

  // ─── TEST 8 ───────────────────────────────────────────────
  it('DELETE /cvs/:id by owner → 200 OK', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/cvs/${cvId}`)
      .set('auth-user', validToken)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(res.body.id).toBe(cvId);
    cvId = undefined as any;
  });
});