import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchSessionsDto } from './dto/search-sessions.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async listSessions(params: { limit: number; offset: number }) {
    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        take: params.limit,
        skip: params.offset,
        orderBy: { lastActive: 'desc' },
        select: {
          id: true,
          sessionId: true,
          userId: true,
          userEmail: true,
          userAgent: true,
          url: true,
          browser: true,
          device: true,
          os: true,
          hasErrors: true,
          startedAt: true,
          lastActive: true,
          eventCount: true,
        },
      }),
      this.prisma.session.count(),
    ]);

    return {
      sessions,
      total,
      limit: params.limit,
      offset: params.offset,
    };
  }

  async searchSessions(searchParams: SearchSessionsDto) {
    const where: Prisma.SessionWhereInput = {};

    // Text search across multiple fields
    if (searchParams.q) {
      const searchTerm = searchParams.q.toLowerCase();
      where.OR = [
        { sessionId: { contains: searchTerm, mode: 'insensitive' } },
        { userId: { contains: searchTerm, mode: 'insensitive' } },
        { userEmail: { contains: searchTerm, mode: 'insensitive' } },
        { url: { contains: searchTerm, mode: 'insensitive' } },
        { userAgent: { contains: searchTerm, mode: 'insensitive' } },
        { browser: { contains: searchTerm, mode: 'insensitive' } },
        { device: { contains: searchTerm, mode: 'insensitive' } },
        { os: { contains: searchTerm, mode: 'insensitive' } },
      ];

      // Also search in events data (console logs, errors, etc.)
      const sessionsWithMatchingEvents = await this.prisma.event.findMany({
        where: {
          OR: [
            { type: { contains: searchTerm, mode: 'insensitive' } },
            // Search in JSON data - PostgreSQL specific
            {
              data: {
                path: ['message'],
                string_contains: searchTerm,
              },
            } as any,
          ],
        },
        select: { sessionId: true },
        distinct: ['sessionId'],
      });

      if (sessionsWithMatchingEvents.length > 0) {
        const sessionIds = sessionsWithMatchingEvents.map((e) => e.sessionId);
        where.OR.push({ sessionId: { in: sessionIds } });
      }
    }

    // Filter by browser
    if (searchParams.browser) {
      where.browser = { contains: searchParams.browser, mode: 'insensitive' };
    }

    // Filter by device
    if (searchParams.device) {
      where.device = { contains: searchParams.device, mode: 'insensitive' };
    }

    // Filter by OS
    if (searchParams.os) {
      where.os = { contains: searchParams.os, mode: 'insensitive' };
    }

    // Filter by error status
    if (searchParams.hasErrors !== undefined) {
      where.hasErrors = searchParams.hasErrors;
    }

    // Date range filter
    if (searchParams.startDate || searchParams.endDate) {
      where.startedAt = {};
      if (searchParams.startDate) {
        where.startedAt.gte = new Date(searchParams.startDate);
      }
      if (searchParams.endDate) {
        where.startedAt.lte = new Date(searchParams.endDate);
      }
    }

    // Build sort order
    const orderBy: Prisma.SessionOrderByWithRelationInput = {
      [searchParams.sortBy || 'lastActive']: searchParams.sortOrder || 'desc',
    };

    // Execute query with pagination
    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        take: searchParams.limit || 50,
        skip: searchParams.offset || 0,
        orderBy,
        select: {
          id: true,
          sessionId: true,
          userId: true,
          userEmail: true,
          userAgent: true,
          url: true,
          browser: true,
          device: true,
          os: true,
          hasErrors: true,
          startedAt: true,
          lastActive: true,
          eventCount: true,
        },
      }),
      this.prisma.session.count({ where }),
    ]);

    return {
      sessions,
      total,
      limit: searchParams.limit || 50,
      offset: searchParams.offset || 0,
      query: searchParams,
    };
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionId },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    return session;
  }

  async getSessionEvents(sessionId: string) {
    const session = await this.getSession(sessionId);

    const events = await this.prisma.event.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });

    return {
      session: {
        id: session.id,
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        eventCount: session.eventCount,
      },
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        timestamp: Number(e.timestamp),
        data: e.data,
      })),
    };
  }
}
