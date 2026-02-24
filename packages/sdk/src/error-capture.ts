import { ErrorEvent } from './types';

export class ErrorCapture {
  private errorHandler: ((event: globalThis.ErrorEvent) => void) | null = null;
  private unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  constructor(private onEvent: (event: ErrorEvent) => void) {}

  start(): void {
    this.errorHandler = (event: globalThis.ErrorEvent) => {
      this.onEvent({
        type: 'error',
        timestamp: Date.now(),
        data: {
          message: event.message,
          stack: event.error?.stack,
        },
      });
    };

    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      this.onEvent({
        type: 'error',
        timestamp: Date.now(),
        data: {
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
        },
      });
    };

    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);
  }

  stop(): void {
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
    }
    if (this.unhandledRejectionHandler) {
      window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
    }
  }
}
