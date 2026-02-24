import { IsString, IsArray, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EventDto {
  @ApiProperty({
    description: 'Event type (e.g., rrweb/full-snapshot, rrweb/mouse-move)',
    example: 'rrweb/full-snapshot',
  })
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Unix timestamp in milliseconds when the event occurred',
    example: 1708777200000,
  })
  @IsNumber()
  timestamp!: number;

  @ApiProperty({
    description: 'Event data payload (structure varies by event type)',
    example: { x: 100, y: 200 },
  })
  data: any;
}

export class IngestEventsDto {
  @ApiProperty({
    description: 'Unique session identifier',
    example: 'sess_abc123def456',
  })
  @IsString()
  sessionId!: string;

  @ApiPropertyOptional({
    description: 'User identifier (if authenticated)',
    example: 'user_789xyz',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'User email address (if available)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({
    description: 'Browser user agent string',
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'URL of the page where events were captured',
    example: 'https://example.com/dashboard',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({
    description: 'Array of captured events',
    type: [EventDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  events!: EventDto[];

  @ApiProperty({
    description: 'Unix timestamp in milliseconds for the batch',
    example: 1708777200000,
  })
  @IsNumber()
  timestamp!: number;
}
