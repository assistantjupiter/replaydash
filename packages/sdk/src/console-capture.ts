import { ConsoleEvent } from './types';

export class ConsoleCapture {
  private originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };

  constructor(private onEvent: (event: ConsoleEvent) => void) {
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
  }

  start(): void {
    const self = this;

    console.log = function (...args: any[]) {
      self.originalConsole.log.apply(console, args);
      self.onEvent({ 
        type: 'console', 
        timestamp: Date.now(),
        data: { level: 'log', args }
      });
    };

    console.info = function (...args: any[]) {
      self.originalConsole.info.apply(console, args);
      self.onEvent({ 
        type: 'console', 
        timestamp: Date.now(),
        data: { level: 'info', args }
      });
    };

    console.warn = function (...args: any[]) {
      self.originalConsole.warn.apply(console, args);
      self.onEvent({ 
        type: 'console', 
        timestamp: Date.now(),
        data: { level: 'warn', args }
      });
    };

    console.error = function (...args: any[]) {
      self.originalConsole.error.apply(console, args);
      self.onEvent({ 
        type: 'console', 
        timestamp: Date.now(),
        data: { level: 'error', args }
      });
    };

    console.debug = function (...args: any[]) {
      self.originalConsole.debug.apply(console, args);
      self.onEvent({ 
        type: 'console', 
        timestamp: Date.now(),
        data: { level: 'debug', args }
      });
    };
  }

  stop(): void {
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;
  }
}
