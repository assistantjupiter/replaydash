import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { CurrentApiKey } from '../auth/api-key.decorator';
import { IngestEventsDto } from './dto/ingest-events.dto';
import { ApiKey } from '@prisma/client';

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
        excluded: { type: 'boolean', example: false },
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
  async ingestEvents(
    @Body() dto: IngestEventsDto,
    @CurrentApiKey() apiKey: ApiKey,
  ) {
    // Check if URL matches any excluded path patterns
    const isExcluded = this.isPathExcluded(dto.url, apiKey.excludedPaths);
    
    if (isExcluded) {
      // Return success but don't process the events
      return { success: true, excluded: true };
    }

    await this.eventsService.ingestEvents(dto);
    return { success: true, excluded: false };
  }

  /**
   * Check if a URL path matches any of the excluded path patterns
   * Supports wildcards: /dashboard/* matches /dashboard/anything
   */
  private isPathExcluded(url: string | undefined, excludedPaths: string[]): boolean {
    if (!url || excludedPaths.length === 0) {
      return false;
    }

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      return excludedPaths.some((pattern) => {
        // Convert pattern to regex
        // /dashboard -> exact match
        // /dashboard/* -> prefix match
        // /dashboard/*/settings -> wildcard match
        const regexPattern = pattern
          .replace(/\*/g, '.*')  // * becomes .*
          .replace(/\//g, '\\/')  // escape slashes
          + (pattern.endsWith('*') ? '' : '$');  // exact match if no trailing *

        const regex = new RegExp(`^${regexPattern}`);
        return regex.test(pathname);
      });
    } catch (e) {
      // If URL parsing fails, don't exclude
      return false;
    }
  }
}
