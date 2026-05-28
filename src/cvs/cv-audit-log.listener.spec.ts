import { Test, TestingModule } from '@nestjs/testing';
import { CvAuditLogListener } from './cv-audit-log.listener';
import { DatabaseService } from 'src/database/database.service';
import { CvEventPayload } from './events/cv.events';

describe('CvAuditLogListener', () => {
  let listener: CvAuditLogListener;
  let mockDatabaseService: {
    cvAuditLog: {
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockDatabaseService = {
      cvAuditLog: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvAuditLogListener,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    listener = module.get<CvAuditLogListener>(CvAuditLogListener);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  it('should save audit log for CREATE', async () => {
    const payload: CvEventPayload = {
      id: 'cv-1',
      userId: 'user-1',
      user: {} as any,
      firstname: 'Alice',
      age: 30,
      job: 'Architect',
      path: '/alice.pdf',
      skills: [{ id: 's-1', designation: 'Arch', createdAt: new Date(), updatedAt: new Date() }],
      actorId: 'user-1',
    };

    await listener.handleCvCreated(payload);

    expect(mockDatabaseService.cvAuditLog.create).toHaveBeenCalledWith({
      data: {
        cvId: 'cv-1',
        cvOwnerId: 'user-1',
        action: 'CREATE',
        firstname: 'Alice',
        age: 30,
        job: 'Architect',
        path: '/alice.pdf',
        skills: 'Arch',
        userId: 'user-1',
      },
    });
  });

  it('should save audit log for UPDATE', async () => {
    const payload: CvEventPayload = {
      id: 'cv-1',
      userId: 'user-1',
      user: {} as any,
      firstname: 'Alice',
      age: 31,
      job: 'Senior Architect',
      path: '/alice_v2.pdf',
      skills: [{ id: 's-1', designation: 'Arch', createdAt: new Date(), updatedAt: new Date() }],
      actorId: 'admin-1', // Admin updated it
    };

    await listener.handleCvUpdated(payload);

    expect(mockDatabaseService.cvAuditLog.create).toHaveBeenCalledWith({
      data: {
        cvId: 'cv-1',
        cvOwnerId: 'user-1',
        action: 'UPDATE',
        firstname: 'Alice',
        age: 31,
        job: 'Senior Architect',
        path: '/alice_v2.pdf',
        skills: 'Arch',
        userId: 'admin-1',
      },
    });
  });

  it('should save audit log for DELETE', async () => {
    const payload: CvEventPayload = {
      id: 'cv-1',
      userId: 'user-1',
      user: {} as any,
      firstname: 'Alice',
      age: 31,
      job: 'Senior Architect',
      path: '/alice_v2.pdf',
      skills: [],
      actorId: 'user-1',
    };

    await listener.handleCvDeleted(payload);

    expect(mockDatabaseService.cvAuditLog.create).toHaveBeenCalledWith({
      data: {
        cvId: 'cv-1',
        cvOwnerId: 'user-1',
        action: 'DELETE',
        firstname: 'Alice',
        age: 31,
        job: 'Senior Architect',
        path: '/alice_v2.pdf',
        skills: null,
        userId: 'user-1',
      },
    });
  });
});
