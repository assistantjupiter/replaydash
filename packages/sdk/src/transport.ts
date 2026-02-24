import { ReplayDashConfig, RecordingEvent, SessionMetadata } from './types';

export class Transport {
  private config: ReplayDashConfig;
  private endpoint: string;
  private queue: RecordingEvent[] = [];
  private isSending: boolean = false;

  constructor(config: ReplayDashConfig) {
    this.config = config;
    this.endpoint = config.endpoint || 'https://api.replaydash.com';
  }

  async send(events: RecordingEvent[], metadata: SessionMetadata): Promise<void> {
    // Add to queue
    this.queue.push(...events);

    // Try to send
    await this.processSendQueue(metadata);
  }

  private async processSendQueue(metadata: SessionMetadata): Promise<void> {
    if (this.isSending || this.queue.length === 0) return;

    this.isSending = true;

    try {
      const eventsToSend = [...this.queue];
      this.queue = [];

      const payload = {
        sessionId: metadata.sessionId,
        userId: metadata.userId,
        userEmail: metadata.userEmail,
        userAgent: metadata.userAgent,
        url: metadata.url,
        events: eventsToSend,
        timestamp: Date.now(),
      };

      const response = await fetch(`${this.endpoint}/api/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('[ReplayDash] Failed to send events:', response.statusText);
        // Re-add to queue on failure
        this.queue.unshift(...eventsToSend);
      }
    } catch (error) {
      console.error('[ReplayDash] Transport error:', error);
    } finally {
      this.isSending = false;
    }
  }
}
