import { NetworkEvent, NetworkCaptureConfig } from './types';

interface NetworkRequestData {
  id: string;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  startTime: number;
}

export class NetworkCapture {
  private originalFetch: typeof fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send;
  private originalXHRSetRequestHeader: typeof XMLHttpRequest.prototype.setRequestHeader;
  private pendingRequests: Map<string, NetworkRequestData> = new Map();
  private requestIdCounter = 0;
  private config: NetworkCaptureConfig;

  constructor(
    private onEvent: (event: NetworkEvent) => void,
    config: NetworkCaptureConfig = {}
  ) {
    this.originalFetch = window.fetch;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
    this.originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    
    this.config = {
      ignoreUrls: config.ignoreUrls || [],
      sanitizeHeaders: config.sanitizeHeaders !== false,
      sensitiveHeaders: config.sensitiveHeaders || [
        'authorization',
        'cookie',
        'set-cookie',
        'x-api-key',
        'api-key',
        'access-token',
        'refresh-token',
      ],
      maxBodyLength: config.maxBodyLength || 10000,
      captureRequestBody: config.captureRequestBody !== false,
      captureResponseBody: config.captureResponseBody !== false,
    };
  }

  start(): void {
    this.interceptFetch();
    this.interceptXHR();
  }

  stop(): void {
    window.fetch = this.originalFetch;
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    XMLHttpRequest.prototype.send = this.originalXHRSend;
    XMLHttpRequest.prototype.setRequestHeader = this.originalXHRSetRequestHeader;
  }

  private shouldIgnoreUrl(url: string): boolean {
    // Ignore ReplayDash API calls to prevent infinite loops
    if (url.includes('/api/events') || url.includes('replaydash')) {
      return true;
    }

    // Check user-defined ignore patterns
    return this.config.ignoreUrls!.some((pattern) => {
      if (typeof pattern === 'string') {
        return url.includes(pattern);
      }
      return pattern.test(url);
    });
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    if (!this.config.sanitizeHeaders) {
      return headers;
    }

    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (this.config.sensitiveHeaders!.includes(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private truncateBody(body: any): any {
    if (!body) return undefined;

    const maxLength = this.config.maxBodyLength!;
    
    try {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      if (bodyStr.length > maxLength) {
        return bodyStr.substring(0, maxLength) + `... [truncated ${bodyStr.length - maxLength} chars]`;
      }
      return bodyStr;
    } catch (e) {
      return '[Unable to serialize body]';
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestIdCounter}`;
  }

  private interceptFetch(): void {
    const self = this;

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      if (self.shouldIgnoreUrl(url)) {
        return self.originalFetch.apply(this, [input, init]);
      }

      const requestId = self.generateRequestId();
      const method = init?.method || 'GET';
      const startTime = Date.now();

      // Capture request headers
      let requestHeaders: Record<string, string> = {};
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
            requestHeaders[key] = value;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            requestHeaders[key] = value;
          });
        } else {
          requestHeaders = { ...init.headers };
        }
      }

      // Capture request body
      let requestBody: any;
      if (self.config.captureRequestBody && init?.body) {
        try {
          if (typeof init.body === 'string') {
            requestBody = init.body;
          } else {
            requestBody = '[Binary or FormData]';
          }
        } catch (e) {
          requestBody = '[Unable to capture body]';
        }
      }

      // Store pending request
      self.pendingRequests.set(requestId, {
        id: requestId,
        method,
        url,
        requestHeaders,
        requestBody,
        startTime,
      });

      try {
        const response = await self.originalFetch.apply(this, [input, init]);
        const duration = Date.now() - startTime;

        // Capture response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        // Clone response to capture body
        let responseBody: any;
        if (self.config.captureResponseBody) {
          try {
            const clonedResponse = response.clone();
            const contentType = response.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
              responseBody = await clonedResponse.json();
            } else if (contentType.includes('text/')) {
              responseBody = await clonedResponse.text();
            } else {
              responseBody = '[Binary content]';
            }
          } catch (e) {
            responseBody = '[Unable to capture response]';
          }
        }

        // Send network event
        const event: NetworkEvent = {
          type: 'network',
          timestamp: startTime,
          data: {
            method,
            url,
            status: response.status,
            statusText: response.statusText,
            requestHeaders: self.sanitizeHeaders(requestHeaders),
            requestBody: self.truncateBody(requestBody),
            responseHeaders: self.sanitizeHeaders(responseHeaders),
            responseBody: self.truncateBody(responseBody),
            duration,
          },
        };

        self.onEvent(event);
        self.pendingRequests.delete(requestId);

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;

        // Send error event
        const event: NetworkEvent = {
          type: 'network',
          timestamp: startTime,
          data: {
            method,
            url,
            status: 0,
            statusText: 'Network Error',
            requestHeaders: self.sanitizeHeaders(requestHeaders),
            requestBody: self.truncateBody(requestBody),
            error: error instanceof Error ? error.message : 'Unknown error',
            duration,
          },
        };

        self.onEvent(event);
        self.pendingRequests.delete(requestId);

        throw error;
      }
    };
  }

  private interceptXHR(): void {
    const self = this;

    // Track XHR request data
    const xhrData = new WeakMap<XMLHttpRequest, NetworkRequestData & { requestHeaders: Record<string, string> }>();

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ): void {
      const urlStr = typeof url === 'string' ? url : url.href;
      
      if (!self.shouldIgnoreUrl(urlStr)) {
        const requestId = self.generateRequestId();
        xhrData.set(this, {
          id: requestId,
          method: method.toUpperCase(),
          url: urlStr,
          requestHeaders: {},
          startTime: Date.now(),
        });
      }

      return self.originalXHROpen.apply(this, [method, url, async ?? true, username, password]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (name: string, value: string): void {
      const data = xhrData.get(this);
      if (data) {
        data.requestHeaders[name] = value;
      }
      return self.originalXHRSetRequestHeader.apply(this, [name, value]);
    };

    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null): void {
      const data = xhrData.get(this);
      
      if (!data) {
        return self.originalXHRSend.apply(this, [body]);
      }

      // Capture request body
      if (self.config.captureRequestBody && body) {
        if (typeof body === 'string') {
          data.requestBody = body;
        } else {
          data.requestBody = '[Binary or FormData]';
        }
      }

      const startTime = Date.now();

      // Listen for response
      this.addEventListener('load', function () {
        const duration = Date.now() - startTime;
        
        let responseBody: any;
        if (self.config.captureResponseBody) {
          const contentType = this.getResponseHeader('content-type') || '';
          if (contentType.includes('application/json')) {
            try {
              responseBody = JSON.parse(this.responseText);
            } catch (e) {
              responseBody = this.responseText;
            }
          } else if (contentType.includes('text/')) {
            responseBody = this.responseText;
          } else {
            responseBody = '[Binary content]';
          }
        }

        // Capture response headers
        const responseHeaders: Record<string, string> = {};
        const headersStr = this.getAllResponseHeaders();
        if (headersStr) {
          headersStr.split('\r\n').forEach((line) => {
            const parts = line.split(': ');
            if (parts.length === 2) {
              responseHeaders[parts[0]] = parts[1];
            }
          });
        }

        const event: NetworkEvent = {
          type: 'network',
          timestamp: data.startTime,
          data: {
            method: data.method,
            url: data.url,
            status: this.status,
            statusText: this.statusText,
            requestHeaders: self.sanitizeHeaders(data.requestHeaders),
            requestBody: self.truncateBody(data.requestBody),
            responseHeaders: self.sanitizeHeaders(responseHeaders),
            responseBody: self.truncateBody(responseBody),
            duration,
          },
        };

        self.onEvent(event);
      });

      this.addEventListener('error', function () {
        const duration = Date.now() - startTime;

        const event: NetworkEvent = {
          type: 'network',
          timestamp: data.startTime,
          data: {
            method: data.method,
            url: data.url,
            status: 0,
            statusText: 'Network Error',
            requestHeaders: self.sanitizeHeaders(data.requestHeaders),
            requestBody: self.truncateBody(data.requestBody),
            error: 'XMLHttpRequest failed',
            duration,
          },
        };

        self.onEvent(event);
      });

      this.addEventListener('timeout', function () {
        const duration = Date.now() - startTime;

        const event: NetworkEvent = {
          type: 'network',
          timestamp: data.startTime,
          data: {
            method: data.method,
            url: data.url,
            status: 0,
            statusText: 'Timeout',
            requestHeaders: self.sanitizeHeaders(data.requestHeaders),
            requestBody: self.truncateBody(data.requestBody),
            error: 'Request timeout',
            duration,
          },
        };

        self.onEvent(event);
      });

      return self.originalXHRSend.apply(this, [body]);
    };
  }
}
