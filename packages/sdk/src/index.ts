/**
 * ReplayDash SDK
 * Browser-based session recording SDK
 */

export interface ReplayDashConfig {
  apiKey: string;
  endpoint?: string;
  sampleRate?: number;
  maskAllInputs?: boolean;
  maskTextSelector?: string;
}

export class ReplayDash {
  private config: ReplayDashConfig;
  private sessionId: string | null = null;

  constructor(config: ReplayDashConfig) {
    this.config = {
      endpoint: 'http://localhost:3001/api/events',
      sampleRate: 1.0,
      maskAllInputs: true,
      ...config,
    };
  }

  /**
   * Initialize the SDK and start recording
   */
  public init(): void {
    this.sessionId = this.generateSessionId();
    console.log('[ReplayDash] SDK initialized', { sessionId: this.sessionId });
    
    // TODO: Implement actual recording logic
    // - DOM mutation observer
    // - Event listeners (click, scroll, input, etc.)
    // - Network request interception
    // - Console log capture
  }

  /**
   * Stop recording and flush events
   */
  public stop(): void {
    console.log('[ReplayDash] Stopping recording');
    this.sessionId = null;
  }

  /**
   * Manually track a custom event
   */
  public track(eventName: string, properties?: Record<string, any>): void {
    if (!this.sessionId) {
      console.warn('[ReplayDash] SDK not initialized');
      return;
    }

    console.log('[ReplayDash] Tracking event', { eventName, properties });
    // TODO: Send event to backend
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export default instance creator
export function init(config: ReplayDashConfig): ReplayDash {
  const instance = new ReplayDash(config);
  instance.init();
  return instance;
}
