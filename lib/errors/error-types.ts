/**
 * Enhanced Error Handling Types
 * Provides structured error handling with user-friendly messages and retry logic
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  originalError?: any;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ErrorRecoveryOptions {
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
  retryAfter?: number; // milliseconds
}

export interface ErrorState {
  hasErrors: boolean;
  errors: Record<string, AppError>;
  retryable: boolean;
  lastRetry?: Date;
}

/**
 * Create a structured error from various error sources
 */
export function createAppError(
  error: any,
  context?: Record<string, any>
): AppError {
  const timestamp = new Date();
  
  // Handle different error types
  if (error?.code === 'PGRST116' || error?.message?.includes('JWT')) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: error.message || 'Authentication failed',
      userMessage: 'Your session has expired. Please log in again.',
      retryable: false,
      originalError: error,
      timestamp,
      context
    };
  }
  
  if (error?.code === '23505' || error?.message?.includes('duplicate')) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message || 'Duplicate entry',
      userMessage: 'This item already exists. Please check your data.',
      retryable: false,
      originalError: error,
      timestamp,
      context
    };
  }
  
  if (error?.code === '23503' || error?.message?.includes('foreign key')) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message || 'Invalid reference',
      userMessage: 'The selected item is no longer available. Please refresh and try again.',
      retryable: true,
      originalError: error,
      timestamp,
      context
    };
  }
  
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: error.message || 'Network error',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      retryable: true,
      originalError: error,
      timestamp,
      context
    };
  }
  
  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    return {
      type: ErrorType.RATE_LIMIT,
      message: error.message || 'Rate limit exceeded',
      userMessage: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
      originalError: error,
      timestamp,
      context
    };
  }
  
  if (error?.status === 404 || error?.message?.includes('not found')) {
    return {
      type: ErrorType.NOT_FOUND,
      message: error.message || 'Resource not found',
      userMessage: 'The requested information could not be found.',
      retryable: false,
      originalError: error,
      timestamp,
      context
    };
  }
  
  if (error?.status === 403 || error?.message?.includes('permission')) {
    return {
      type: ErrorType.PERMISSION,
      message: error.message || 'Permission denied',
      userMessage: 'You don\'t have permission to perform this action.',
      retryable: false,
      originalError: error,
      timestamp,
      context
    };
  }
  
  if (error?.status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: error.message || 'Server error',
      userMessage: 'Something went wrong on our end. Please try again later.',
      retryable: true,
      originalError: error,
      timestamp,
      context
    };
  }
  
  // Default to unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    retryable: true,
    originalError: error,
    timestamp,
    context
  };
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyMessage(errorType: ErrorType): string {
  const messages = {
    [ErrorType.NETWORK]: 'Unable to connect to the server. Please check your internet connection.',
    [ErrorType.AUTHENTICATION]: 'Your session has expired. Please log in again.',
    [ErrorType.VALIDATION]: 'Please check your input and try again.',
    [ErrorType.SERVER]: 'Something went wrong on our end. Please try again later.',
    [ErrorType.PERMISSION]: 'You don\'t have permission to perform this action.',
    [ErrorType.NOT_FOUND]: 'The requested information could not be found.',
    [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorType.UNKNOWN]: 'Something went wrong. Please try again.'
  };
  
  return messages[errorType] || messages[ErrorType.UNKNOWN];
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return error.retryable && error.type !== ErrorType.AUTHENTICATION;
}

/**
 * Get retry delay based on error type and attempt count
 */
export function getRetryDelay(errorType: ErrorType, attemptCount: number): number {
  const baseDelays: Record<ErrorType, number> = {
    [ErrorType.NETWORK]: 1000,
    [ErrorType.AUTHENTICATION]: 0, // Don't retry auth errors
    [ErrorType.VALIDATION]: 1000,
    [ErrorType.SERVER]: 2000,
    [ErrorType.PERMISSION]: 0, // Don't retry permission errors
    [ErrorType.NOT_FOUND]: 0, // Don't retry not found errors
    [ErrorType.RATE_LIMIT]: 5000,
    [ErrorType.UNKNOWN]: 1500
  };
  
  const baseDelay = baseDelays[errorType] || 1000;
  // Exponential backoff with jitter
  return baseDelay * Math.pow(2, attemptCount - 1) + Math.random() * 1000;
}
