import { ReplayDashConfig } from './types';
import { SessionManager } from './session';
import { Recorder } from './recorder';
import { Transport } from './transport';
import { ConsoleCapture } from './console-capture';
import { ErrorCapture } from './error-capture';
import { NetworkCapture } from './network-capture';

class ReplayDash {
  private config: ReplayDashConfig | null = null;
  private sessionManager: SessionManager | null = null;
  private recorder: Recorder | null = null;
  private transport: Transport | null = null;
  private consoleCapture: ConsoleCapture | null = null;
  private errorCapture: ErrorCapture | null = null;
  private networkCapture: NetworkCapture | null = null;
  private isInitialized: boolean = false;

  init(config: ReplayDashConfig): void {
    if (this.isInitialized) {
      console.warn('[ReplayDash] Already initialized');
      return;
    }

    if (!config.apiKey) {
      throw new Error('[ReplayDash] API key is required');
    }

    this.config = config;
    this.sessionManager = new SessionManager();
    this.transport = new Transport(config);

    // Start recorder
    this.recorder = new Recorder(config, (events) => {
      if (this.transport && this.sessionManager) {
        this.transport.send(events, this.sessionManager.getMetadata());
      }
    });
    this.recorder.start();

    // Start console capture if enabled
    if (config.captureConsole !== false) {
      this.consoleCapture = new ConsoleCapture((event) => {
        if (this.transport && this.sessionManager) {
          this.transport.send([event], this.sessionManager.getMetadata());
        }
      });
      this.consoleCapture.start();
    }

    // Start error capture
    this.errorCapture = new ErrorCapture((event) => {
      if (this.transport && this.sessionManager) {
        this.transport.send([event], this.sessionManager.getMetadata());
      }
    });
    this.errorCapture.start();

    // Start network capture if enabled
    if (config.captureNetwork !== false) {
      this.networkCapture = new NetworkCapture(
        (event) => {
          if (this.transport && this.sessionManager) {
            this.transport.send([event], this.sessionManager.getMetadata());
          }
        },
        config.networkConfig
      );
      this.networkCapture.start();
    }

    this.isInitialized = true;
    console.log('[ReplayDash] Initialized successfully');
  }

  setUser(userId: string, userEmail?: string): void {
    if (!this.sessionManager) {
      console.warn('[ReplayDash] Not initialized');
      return;
    }

    this.sessionManager.setUserId(userId);
    if (userEmail) {
      this.sessionManager.setUserEmail(userEmail);
    }
  }

  getSessionId(): string | null {
    return this.sessionManager?.getSessionId() || null;
  }

  stop(): void {
    this.recorder?.stop();
    this.consoleCapture?.stop();
    this.errorCapture?.stop();
    this.networkCapture?.stop();
    this.isInitialized = false;
    console.log('[ReplayDash] Stopped');
  }
}

// Export singleton instance
export const replayDash = new ReplayDash();

// Export for direct instantiation if needed
export { ReplayDash };

// Export types
export * from './types';
