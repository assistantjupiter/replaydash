export interface NetworkCaptureConfig {
  ignoreUrls?: (string | RegExp)[];
  sanitizeHeaders?: boolean;
  sensitiveHeaders?: string[];
  maxBodyLength?: number;
  captureRequestBody?: boolean;
  captureResponseBody?: boolean;
}

export interface ReplayDashConfig {
  apiKey: string;
  endpoint?: string;
  sessionSampleRate?: number;
  captureConsole?: boolean;
  captureNetwork?: boolean;
  networkConfig?: NetworkCaptureConfig;
  maskAllInputs?: boolean;
  blockSelector?: string;
  ignoreSelector?: string;
}

export interface SessionMetadata {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  userAgent: string;
  url: string;
  timestamp: number;
}

export interface RecordingEvent {
  type: string;
  timestamp: number;
  data: any;
}

export interface NetworkEventData {
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  error?: string;
  duration?: number;
}

export interface NetworkEvent extends RecordingEvent {
  type: 'network';
  data: NetworkEventData;
}

export interface ConsoleEventData {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  args: any[];
}

export interface ConsoleEvent extends RecordingEvent {
  type: 'console';
  data: ConsoleEventData;
}

export interface ErrorEventData {
  message: string;
  stack?: string;
}

export interface ErrorEvent extends RecordingEvent {
  type: 'error';
  data: ErrorEventData;
}
