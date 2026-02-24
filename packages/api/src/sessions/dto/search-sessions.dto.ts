import { IsOptional, IsString, IsBoolean, IsInt, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortField {
  STARTED_AT = 'startedAt',
  LAST_ACTIVE = 'lastActive',
  EVENT_COUNT = 'eventCount',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchSessionsDto {
  @IsOptional()
  @IsString()
  q?: string; // Search query

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasErrors?: boolean;

  @IsOptional()
  @IsString()
  startDate?: string; // ISO date string

  @IsOptional()
  @IsString()
  endDate?: string; // ISO date string

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.LAST_ACTIVE;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
