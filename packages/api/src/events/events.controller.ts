import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { IngestEventsDto } from './dto/ingest-events.dto';

@ApiTags('events')
@ApiSecurity('api-key')
@Controller('api/v1/events')
@UseGuards(ApiKeyGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiOperation({
    summary: 'Ingest session events',
    description: 'Captures and stores user interaction events for session replay. Includes DOM snapshots, clicks, scrolls, and other user interactions.',
  })
  @ApiBody({
    type: IngestEventsDto,
    examples: {
      basic: {
        summary: 'Basic event ingestion',
        value: {
          sessionId: 'sess_abc123def456',
          userId: 'user_789xyz',
          userEmail: 'user@example.com',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          url: 'https://example.com/dashboard',
          timestamp: Date.now(),
          events: [
            {
              type: 'rrweb/full-snapshot',
              timestamp: Date.now(),
              data: {
                node: { type: 0, childNodes: [] },
                initialOffset: { top: 0, left: 0 },
              },
            },
            {
              type: 'rrweb/mouse-move',
              timestamp: Date.now() + 100,
              data: { x: 150, y: 200 },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Events successfully ingested',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  async ingestEvents(@Body() dto: IngestEventsDto) {
    await this.eventsService.ingestEvents(dto);
    return { success: true };
  }
}
