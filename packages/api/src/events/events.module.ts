import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsProcessor } from './events.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsProcessor],
})
export class EventsModule {}
