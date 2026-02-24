import { SessionMetadata } from './types';

export class SessionManager {
  private sessionId: string | null = null;
  private metadata: SessionMetadata | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }
    return this.sessionId;
  }

  getMetadata(): SessionMetadata {
    if (!this.metadata) {
      this.metadata = {
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      };
    }
    return this.metadata;
  }

  setUserId(userId: string): void {
    if (this.metadata) {
      this.metadata.userId = userId;
    }
  }

  setUserEmail(email: string): void {
    if (this.metadata) {
      this.metadata.userEmail = email;
    }
  }

  reset(): void {
    this.sessionId = this.generateSessionId();
    this.metadata = null;
  }
}
