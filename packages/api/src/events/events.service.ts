import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IngestEventsDto } from './dto/ingest-events.dto';

@Injectable()
export class EventsService {
  constructor(@InjectQueue('events') private eventsQueue: Queue) {}

  async ingestEvents(dto: IngestEventsDto): Promise<void> {
    // Add to queue for async processing
    await this.eventsQueue.add('process-events', dto, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
