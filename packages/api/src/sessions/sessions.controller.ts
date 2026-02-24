import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { SearchSessionsDto } from './dto/search-sessions.dto';

@Controller('api/v1/sessions')
@UseGuards(ApiKeyGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  async listSessions(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.sessionsService.listSessions({
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  @Get('search')
  async searchSessions(@Query() searchParams: SearchSessionsDto) {
    return this.sessionsService.searchSessions(searchParams);
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.sessionsService.getSession(id);
  }

  @Get(':id/events')
  async getSessionEvents(@Param('id') id: string) {
    return this.sessionsService.getSessionEvents(id);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string) {
    return this.sessionsService.deleteSession(id);
  }
}
