/**
 * Enhanced Error Handler for Supabase
 * 
 * This module provides comprehensive error handling for Supabase operations,
 * including authentication, database, and storage errors.
 */

export interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface ProcessedError {
  type: 'auth' | 'database' | 'network' | 'validation' | 'unknown';
  category: 'user' | 'system' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  actionRequired: boolean;
  suggestedAction?: string;
}

// Supabase Authentication Error Codes
const AUTH_ERROR_CODES = {
  // Sign Up Errors
  'signup_disabled': {
    userMessage: 'New account registration is currently disabled. Please contact support.',
    category: 'system' as const,
    severity: 'high' as const,
    actionRequired: true,
    suggestedAction: 'Contact support'
  },
  'email_address_invalid': {
    userMessage: 'Please enter a valid email address.',
    category: 'user' as const,
    severity: 'low' as const,
    actionRequired: true,
    suggestedAction: 'Check email format'
  },
  'password_too_short': {
    userMessage: 'Password must be at least 6 characters long.',
    category: 'user' as const,
    severity: 'low' as const,
    actionRequired: true,
    suggestedAction: 'Use a longer password'
  },
  'user_already_registered': {
    userMessage: 'An account with this email already exists. Please sign in instead.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Try signing in'
  },
  'email_not_confirmed': {
    userMessage: 'Please check your email and click the confirmation link before signing in.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Check your email'
  },
  
  // Sign In Errors
  'invalid_credentials': {
    userMessage: 'Invalid email or password. Please check your credentials and try again.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Verify credentials'
  },
  'too_many_requests': {
    userMessage: 'Too many login attempts. Please wait a few minutes before trying again.',
    category: 'security' as const,
    severity: 'high' as const,
    actionRequired: true,
    suggestedAction: 'Wait and try again'
  },
  'email_not_confirmed_signin': {
    userMessage: 'Please check your email and click the confirmation link before signing in.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Check your email'
  },
  
  // Password Reset Errors
  'password_reset_required': {
    userMessage: 'Password reset is required. Please check your email for reset instructions.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Check your email'
  },
  'invalid_token': {
    userMessage: 'The reset link has expired or is invalid. Please request a new password reset.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Request new reset link'
  },
  
  // OAuth Errors
  'oauth_provider_error': {
    userMessage: 'There was an issue with the social login provider. Please try again or use email/password.',
    category: 'system' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Try email/password login'
  },
  'oauth_account_not_linked': {
    userMessage: 'This social account is not linked to any user. Please sign up first.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Create an account'
  },
  
  // General Auth Errors
  'session_not_found': {
    userMessage: 'Your session has expired. Please sign in again.',
    category: 'security' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Sign in again'
  },
  'invalid_request': {
    userMessage: 'Invalid request. Please try again.',
    category: 'user' as const,
    severity: 'low' as const,
    actionRequired: true,
    suggestedAction: 'Retry the action'
  }
};

// Database Error Codes
const DATABASE_ERROR_CODES = {
  '23505': { // Unique violation
    userMessage: 'This information is already in use. Please try a different value.',
    category: 'user' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Use different information'
  },
  '23503': { // Foreign key violation
    userMessage: 'Cannot perform this action due to related data. Please contact support.',
    category: 'system' as const,
    severity: 'high' as const,
    actionRequired: true,
    suggestedAction: 'Contact support'
  },
  '23502': { // Not null violation
    userMessage: 'Required information is missing. Please fill in all required fields.',
    category: 'user' as const,
    severity: 'low' as const,
    actionRequired: true,
    suggestedAction: 'Complete all fields'
  },
  '42P01': { // Undefined table
    userMessage: 'A system error occurred. Please try again later.',
    category: 'system' as const,
    severity: 'critical' as const,
    actionRequired: false,
    suggestedAction: 'Contact support'
  }
};

// Network Error Patterns
const NETWORK_ERROR_PATTERNS = [
  {
    pattern: /network error|connection failed|timeout/i,
    userMessage: 'Network connection failed. Please check your internet connection and try again.',
    category: 'system' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Check internet connection'
  },
  {
    pattern: /fetch failed|request failed/i,
    userMessage: 'Unable to connect to the server. Please try again in a moment.',
    category: 'system' as const,
    severity: 'medium' as const,
    actionRequired: true,
    suggestedAction: 'Retry the action'
  }
];

export function processSupabaseError(error: any): ProcessedError {
  // Handle null/undefined errors
  if (!error) {
    return {
      type: 'unknown',
      category: 'system',
      severity: 'medium',
      userMessage: 'An unexpected error occurred.',
      technicalMessage: 'No error details available',
      actionRequired: false
    };
  }

  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.status;

  // Check for authentication errors
  if (errorCode && AUTH_ERROR_CODES[errorCode as keyof typeof AUTH_ERROR_CODES]) {
    const errorConfig = AUTH_ERROR_CODES[errorCode as keyof typeof AUTH_ERROR_CODES];
    return {
      type: 'auth',
      category: errorConfig.category,
      severity: errorConfig.severity,
      userMessage: errorConfig.userMessage,
      technicalMessage: `Auth Error ${errorCode}: ${errorMessage}`,
      actionRequired: errorConfig.actionRequired,
      suggestedAction: errorConfig.suggestedAction
    };
  }

  // Check for database errors
  if (errorCode && DATABASE_ERROR_CODES[errorCode as keyof typeof DATABASE_ERROR_CODES]) {
    const errorConfig = DATABASE_ERROR_CODES[errorCode as keyof typeof DATABASE_ERROR_CODES];
    return {
      type: 'database',
      category: errorConfig.category,
      severity: errorConfig.severity,
      userMessage: errorConfig.userMessage,
      technicalMessage: `Database Error ${errorCode}: ${errorMessage}`,
      actionRequired: errorConfig.actionRequired,
      suggestedAction: errorConfig.suggestedAction
    };
  }

  // Check for network errors
  for (const networkError of NETWORK_ERROR_PATTERNS) {
    if (networkError.pattern.test(errorMessage)) {
      return {
        type: 'network',
        category: networkError.category,
        severity: networkError.severity,
        userMessage: networkError.userMessage,
        technicalMessage: `Network Error: ${errorMessage}`,
        actionRequired: networkError.actionRequired,
        suggestedAction: networkError.suggestedAction
      };
    }
  }

  // Check for common error message patterns
  if (errorMessage.includes('Invalid login credentials')) {
    return {
      type: 'auth',
      category: 'user',
      severity: 'medium',
      userMessage: 'Invalid email or password. Please check your credentials and try again.',
      technicalMessage: errorMessage,
      actionRequired: true,
      suggestedAction: 'Verify credentials'
    };
  }

  if (errorMessage.includes('User already registered')) {
    return {
      type: 'auth',
      category: 'user',
      severity: 'medium',
      userMessage: 'An account with this email already exists. Please sign in instead.',
      technicalMessage: errorMessage,
      actionRequired: true,
      suggestedAction: 'Try signing in'
    };
  }

  if (errorMessage.includes('Email not confirmed')) {
    return {
      type: 'auth',
      category: 'user',
      severity: 'medium',
      userMessage: 'Please check your email and click the confirmation link before signing in.',
      technicalMessage: errorMessage,
      actionRequired: true,
      suggestedAction: 'Check your email'
    };
  }

  if (errorMessage.includes('Too many requests')) {
    return {
      type: 'auth',
      category: 'security',
      severity: 'high',
      userMessage: 'Too many login attempts. Please wait a few minutes before trying again.',
      technicalMessage: errorMessage,
      actionRequired: true,
      suggestedAction: 'Wait and try again'
    };
  }

  // Default fallback
  return {
    type: 'unknown',
    category: 'system',
    severity: 'medium',
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: errorMessage,
    actionRequired: true,
    suggestedAction: 'Retry the action'
  };
}

// Helper function to get error type for styling
export function getErrorTypeFromProcessed(processedError: ProcessedError): 'error' | 'warning' | 'info' {
  switch (processedError.severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'info';
  }
}

// Helper function to determine if error should be logged
export function shouldLogError(processedError: ProcessedError): boolean {
  return processedError.severity === 'critical' || processedError.severity === 'high';
}

// Helper function to get retry recommendation
export function getRetryRecommendation(processedError: ProcessedError): string | null {
  if (processedError.type === 'network' || processedError.type === 'unknown') {
    return 'This error might be temporary. Please try again in a moment.';
  }
  return null;
}
