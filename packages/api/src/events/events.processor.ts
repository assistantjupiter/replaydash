import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { IngestEventsDto } from './dto/ingest-events.dto';

@Processor('events')
export class EventsProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('process-events')
  async processEvents(job: Job<IngestEventsDto>) {
    const { sessionId, userId, userEmail, userAgent, url, events } = job.data;

    // Upsert session
    const session = await this.prisma.session.upsert({
      where: { sessionId },
      create: {
        sessionId,
        userId,
        userEmail,
        userAgent,
        url,
        eventCount: events.length,
      },
      update: {
        lastActive: new Date(),
        eventCount: {
          increment: events.length,
        },
      },
    });

    // Batch insert events
    await this.prisma.event.createMany({
      data: events.map((event) => ({
        sessionId,
        type: event.type,
        timestamp: BigInt(event.timestamp),
        data: event.data,
      })),
      skipDuplicates: true,
    });

    console.log(`[EventsProcessor] Processed ${events.length} events for session ${sessionId}`);
  }
}
