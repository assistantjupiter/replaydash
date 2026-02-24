import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { SearchSessionsDto } from './dto/search-sessions.dto';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    session: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchSessions', () => {
    it('should search sessions by query string', async () => {
      const mockSessions = [
        {
          id: '1',
          sessionId: 'ses_123',
          userId: 'user_1',
          userEmail: 'test@example.com',
          url: 'https://example.com',
          browser: 'Chrome',
          device: 'Desktop',
          os: 'macOS',
          hasErrors: false,
          startedAt: new Date(),
          lastActive: new Date(),
          eventCount: 10,
        },
      ];

      mockPrismaService.session.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.session.count.mockResolvedValue(1);
      mockPrismaService.event.findMany.mockResolvedValue([]);

      const searchParams: SearchSessionsDto = {
        q: 'test',
        limit: 50,
        offset: 0,
      };

      const result = await service.searchSessions(searchParams);

      expect(result.sessions).toEqual(mockSessions);
      expect(result.total).toBe(1);
      expect(mockPrismaService.session.findMany).toHaveBeenCalled();
    });

    it('should filter sessions by browser', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);
      mockPrismaService.session.count.mockResolvedValue(0);

      const searchParams: SearchSessionsDto = {
        browser: 'Chrome',
        limit: 50,
        offset: 0,
      };

      await service.searchSessions(searchParams);

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            browser: { contains: 'Chrome', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter sessions by device', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);
      mockPrismaService.session.count.mockResolvedValue(0);

      const searchParams: SearchSessionsDto = {
        device: 'Mobile',
        limit: 50,
        offset: 0,
      };

      await service.searchSessions(searchParams);

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            device: { contains: 'Mobile', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter sessions with errors', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);
      mockPrismaService.session.count.mockResolvedValue(0);

      const searchParams: SearchSessionsDto = {
        hasErrors: true,
        limit: 50,
        offset: 0,
      };

      await service.searchSessions(searchParams);

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hasErrors: true,
          }),
        }),
      );
    });

    it('should filter sessions by date range', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);
      mockPrismaService.session.count.mockResolvedValue(0);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const searchParams: SearchSessionsDto = {
        startDate,
        endDate,
        limit: 50,
        offset: 0,
      };

      await service.searchSessions(searchParams);

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startedAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);
      mockPrismaService.session.count.mockResolvedValue(0);

      const searchParams: SearchSessionsDto = {
        limit: 20,
        offset: 40,
      };

      await service.searchSessions(searchParams);

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        }),
      );
    });

    it('should sort results by specified field and order', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);
      mockPrismaService.session.count.mockResolvedValue(0);

      const searchParams: SearchSessionsDto = {
        sortBy: 'eventCount' as any,
        sortOrder: 'asc' as any,
        limit: 50,
        offset: 0,
      };

      await service.searchSessions(searchParams);

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            eventCount: 'asc',
          },
        }),
      );
    });
  });

  describe('listSessions', () => {
    it('should list sessions with pagination', async () => {
      const mockSessions = [
        {
          id: '1',
          sessionId: 'ses_123',
          userId: 'user_1',
          userEmail: 'test@example.com',
          url: 'https://example.com',
          browser: 'Chrome',
          device: 'Desktop',
          os: 'macOS',
          hasErrors: false,
          startedAt: new Date(),
          lastActive: new Date(),
          eventCount: 10,
        },
      ];

      mockPrismaService.session.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.session.count.mockResolvedValue(1);

      const result = await service.listSessions({ limit: 50, offset: 0 });

      expect(result.sessions).toEqual(mockSessions);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('getSession', () => {
    it('should return a session by sessionId', async () => {
      const mockSession = {
        id: '1',
        sessionId: 'ses_123',
        userId: 'user_1',
        user: { id: 'user_1', email: 'test@example.com' },
      };

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const result = await service.getSession('ses_123');

      expect(result).toEqual(mockSession);
      expect(mockPrismaService.session.findUnique).toHaveBeenCalledWith({
        where: { sessionId: 'ses_123' },
        include: { user: true },
      });
    });

    it('should throw NotFoundException if session not found', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(service.getSession('invalid_id')).rejects.toThrow(
        'Session invalid_id not found',
      );
    });
  });
});
