"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AppError, ErrorType } from '@/lib/errors/error-types';
import { ErrorHandler } from '@/lib/errors/error-handler';

interface ErrorRecoveryCardProps {
  errors: Record<string, AppError>;
  onRetry: () => void;
  onDismiss?: () => void;
  retryable?: boolean;
  className?: string;
}

/**
 * Error Recovery Card Component
 * Displays user-friendly error messages with recovery options
 */
export function ErrorRecoveryCard({
  errors,
  onRetry,
  onDismiss,
  retryable = true,
  className = ""
}: ErrorRecoveryCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const errorEntries = Object.entries(errors);
  const primaryError = errorEntries[0]?.[1];
  const hasMultipleErrors = errorEntries.length > 1;

  const handleRetry = async () => {
    if (!retryable || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = (errorType: ErrorType) => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return '🌐';
      case ErrorType.AUTHENTICATION:
        return '🔐';
      case ErrorType.VALIDATION:
        return '⚠️';
      case ErrorType.SERVER:
        return '🖥️';
      case ErrorType.PERMISSION:
        return '🚫';
      case ErrorType.NOT_FOUND:
        return '🔍';
      case ErrorType.RATE_LIMIT:
        return '⏱️';
      default:
        return '❌';
    }
  };

  const getErrorColor = (errorType: ErrorType) => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case ErrorType.AUTHENTICATION:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ErrorType.VALIDATION:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case ErrorType.SERVER:
        return 'bg-red-50 border-red-200 text-red-800';
      case ErrorType.PERMISSION:
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case ErrorType.NOT_FOUND:
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case ErrorType.RATE_LIMIT:
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!primaryError) {
    return null;
  }

  return (
    <Card className={`border-l-4 border-l-red-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">{getErrorIcon(primaryError.type)}</span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-medium text-gray-900">
                {hasMultipleErrors ? 'Multiple Issues Detected' : 'Something went wrong'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {primaryError.userMessage}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasMultipleErrors && (
              <Badge variant="secondary" className="text-xs">
                {errorEntries.length} issues
              </Badge>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {retryable && primaryError.retryable && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>

          {/* Recovery Suggestions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  What you can try:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {ErrorHandler.getRecoverySuggestions(primaryError).map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Multiple Errors Details */}
          {hasMultipleErrors && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="text-sm font-medium text-gray-700">
                    View all {errorEntries.length} issues
                  </span>
                  <span className="text-sm text-gray-500">
                    {isExpanded ? 'Hide' : 'Show'}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {errorEntries.map(([key, error], index) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border ${getErrorColor(error.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">
                        {getErrorIcon(error.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {error.type.replace('_', ' ')}
                          </span>
                          <Badge
                            variant={error.retryable ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {error.retryable ? 'Retryable' : 'Non-retryable'}
                          </Badge>
                        </div>
                        <p className="text-sm">{error.userMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="text-sm font-medium text-gray-700">
                    Technical Details
                  </span>
                  <span className="text-sm text-gray-500">Show</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="bg-gray-100 rounded-lg p-3">
                  <pre className="text-xs font-mono text-gray-600 overflow-auto max-h-32">
                    {JSON.stringify(primaryError, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


