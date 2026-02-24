import { record } from 'rrweb';
import type { eventWithTime } from 'rrweb';
import { ReplayDashConfig, RecordingEvent } from './types';

export class Recorder {
  private stopRecording: (() => void) | null = null;
  private events: eventWithTime[] = [];
  private config: ReplayDashConfig;
  private flushInterval: number = 10000; // 10 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: ReplayDashConfig, private onFlush: (events: RecordingEvent[]) => void) {
    this.config = config;
  }

  start(): void {
    if (this.stopRecording) {
      console.warn('[ReplayDash] Recording already started');
      return;
    }

    const stopFn = record({
      emit: (event) => {
        this.events.push(event);
        
        // Auto-flush if buffer gets too large (>100 events)
        if (this.events.length >= 100) {
          this.flush();
        }
      },
      checkoutEveryNms: 5 * 60 * 1000, // Create full snapshot every 5 minutes
      maskAllInputs: this.config.maskAllInputs ?? true,
      blockSelector: this.config.blockSelector,
      ignoreSelector: this.config.ignoreSelector,
    });

    this.stopRecording = stopFn || null;

    // Set up periodic flush
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);

    console.log('[ReplayDash] Recording started');
  }

  stop(): void {
    if (this.stopRecording) {
      this.stopRecording();
      this.stopRecording = null;
    }

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Final flush
    this.flush();

    console.log('[ReplayDash] Recording stopped');
  }

  private flush(): void {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    this.onFlush(eventsToSend.map(e => ({
      type: 'rrweb',
      timestamp: e.timestamp,
      data: e,
    })));
  }
}
