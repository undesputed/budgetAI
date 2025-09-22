/**
 * Enhanced Error Handler Service
 * Provides retry logic, error recovery, and structured error handling
 */

import { AppError, ErrorType, createAppError, isRetryableError, getRetryDelay } from './error-types';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: AppError) => boolean;
}

export interface ErrorHandlerOptions {
  context?: Record<string, any>;
  retryOptions?: RetryOptions;
  logErrors?: boolean;
}

/**
 * Enhanced error handler with retry logic and structured error handling
 */
export class ErrorHandler {
  private static defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: isRetryableError
  };

  /**
   * Execute an operation with retry logic and enhanced error handling
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const retryOptions = { ...this.defaultRetryOptions, ...options };
    let lastError: AppError | null = null;
    
    for (let attempt = 1; attempt <= retryOptions.maxRetries!; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        const appError = createAppError(error);
        lastError = appError;
        
        // Log error for debugging
        if (process.env.NODE_ENV === 'development') {
          console.error(`Attempt ${attempt} failed:`, {
            error: appError,
            attempt,
            maxRetries: retryOptions.maxRetries
          });
        }
        
        // Check if we should retry
        if (attempt === retryOptions.maxRetries || !retryOptions.retryCondition!(appError)) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryOptions.baseDelay! * Math.pow(retryOptions.backoffMultiplier!, attempt - 1),
          retryOptions.maxDelay!
        );
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 1000;
        const totalDelay = delay + jitter;
        
        await this.sleep(totalDelay);
      }
    }
    
    throw lastError || createAppError(new Error('Operation failed after all retries'));
  }

  /**
   * Execute multiple operations with individual error handling
   */
  static async withSettled<T>(
    operations: Array<() => Promise<T>>,
    options: ErrorHandlerOptions = {}
  ): Promise<{
    results: Array<{ success: boolean; data?: T; error?: AppError }>;
    hasErrors: boolean;
    errors: Record<string, AppError>;
  }> {
    const results = await Promise.allSettled(
      operations.map(operation => 
        this.withRetry(operation, options.retryOptions)
      )
    );

    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value };
      } else {
        const error = createAppError(result.reason, { operationIndex: index });
        return { success: false, error };
      }
    });

    const errors: Record<string, AppError> = {};
    let hasErrors = false;

    processedResults.forEach((result, index) => {
      if (!result.success && result.error) {
        errors[`operation_${index}`] = result.error;
        hasErrors = true;
      }
    });

    return {
      results: processedResults,
      hasErrors,
      errors
    };
  }

  /**
   * Handle errors with user-friendly messages and recovery options
   */
  static handleError(
    error: any,
    context?: Record<string, any>,
    options: ErrorHandlerOptions = {}
  ): AppError {
    const appError = createAppError(error, context);
    
    if (options.logErrors !== false) {
      this.logError(appError);
    }
    
    return appError;
  }

  /**
   * Log error with structured information
   */
  private static logError(error: AppError): void {
    const logData = {
      type: error.type,
      message: error.message,
      userMessage: error.userMessage,
      retryable: error.retryable,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.originalError?.stack
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', logData);
    } else {
      // In production, you might want to send this to an error tracking service
      // like Sentry, LogRocket, or similar
      console.error('Application Error:', {
        type: error.type,
        message: error.message,
        timestamp: error.timestamp
      });
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retryable operation wrapper
   */
  static createRetryableOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ) {
    return () => this.withRetry(operation, options);
  }

  /**
   * Check if an error should trigger a redirect
   */
  static shouldRedirect(error: AppError): { shouldRedirect: boolean; path?: string } {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return { shouldRedirect: true, path: '/auth/login' };
      case ErrorType.PERMISSION:
        return { shouldRedirect: true, path: '/dashboard' };
      default:
        return { shouldRedirect: false };
    }
  }

  /**
   * Get error recovery suggestions
   */
  static getRecoverySuggestions(error: AppError): string[] {
    const suggestions: Record<ErrorType, string[]> = {
      [ErrorType.NETWORK]: [
        'Check your internet connection',
        'Try refreshing the page',
        'Contact support if the problem persists'
      ],
      [ErrorType.AUTHENTICATION]: [
        'Log out and log back in',
        'Clear your browser cache',
        'Contact support if the problem persists'
      ],
      [ErrorType.VALIDATION]: [
        'Check your input data',
        'Try a different approach',
        'Contact support if the problem persists'
      ],
      [ErrorType.SERVER]: [
        'Try again in a few minutes',
        'Check our status page',
        'Contact support if the problem persists'
      ],
      [ErrorType.PERMISSION]: [
        'Contact your administrator',
        'Check your account permissions',
        'Contact support if you believe this is an error'
      ],
      [ErrorType.NOT_FOUND]: [
        'Check the URL or search terms',
        'Navigate back to the main page',
        'Contact support if you believe this is an error'
      ],
      [ErrorType.RATE_LIMIT]: [
        'Wait a few minutes before trying again',
        'Reduce the frequency of your requests',
        'Contact support if you need higher limits'
      ],
      [ErrorType.UNKNOWN]: [
        'Try refreshing the page',
        'Clear your browser cache',
        'Contact support if the problem persists'
      ]
    };

    return suggestions[error.type] || suggestions[ErrorType.UNKNOWN];
  }
}


