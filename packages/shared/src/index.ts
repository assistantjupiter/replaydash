/**
 * Shared types and utilities for ReplayDash
 */

// Event Types
export enum EventType {
  DOM_MUTATION = 'dom_mutation',
  CLICK = 'click',
  INPUT = 'input',
  SCROLL = 'scroll',
  NAVIGATION = 'navigation',
  NETWORK = 'network',
  CONSOLE = 'console',
  ERROR = 'error',
  CUSTOM = 'custom',
}

export interface BaseEvent {
  type: EventType;
  timestamp: number;
  sessionId: string;
}

export interface DomMutationEvent extends BaseEvent {
  type: EventType.DOM_MUTATION;
  mutations: Array<{
    type: 'added' | 'removed' | 'text' | 'attribute';
    target: string; // CSS selector or node path
    value?: string;
  }>;
}

export interface ClickEvent extends BaseEvent {
  type: EventType.CLICK;
  x: number;
  y: number;
  target: string;
}

export interface InputEvent extends BaseEvent {
  type: EventType.INPUT;
  target: string;
  value: string; // May be masked
  masked: boolean;
}

export interface ScrollEvent extends BaseEvent {
  type: EventType.SCROLL;
  x: number;
  y: number;
}

export interface NavigationEvent extends BaseEvent {
  type: EventType.NAVIGATION;
  url: string;
  referrer?: string;
}

export interface NetworkEvent extends BaseEvent {
  type: EventType.NETWORK;
  method: string;
  url: string;
  status?: number;
  duration?: number;
}

export interface ConsoleEvent extends BaseEvent {
  type: EventType.CONSOLE;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  args?: any[];
}

export interface ErrorEvent extends BaseEvent {
  type: EventType.ERROR;
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
}

export interface CustomEvent extends BaseEvent {
  type: EventType.CUSTOM;
  name: string;
  properties?: Record<string, any>;
}

export type ReplayEvent =
  | DomMutationEvent
  | ClickEvent
  | InputEvent
  | ScrollEvent
  | NavigationEvent
  | NetworkEvent
  | ConsoleEvent
  | ErrorEvent
  | CustomEvent;

// Session Types
export interface Session {
  id: string;
  userId?: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  eventCount: number;
  url: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
