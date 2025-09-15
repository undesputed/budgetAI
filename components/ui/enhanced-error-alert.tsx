"use client";

import { AlertCircle, CheckCircle, Info, X, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { processSupabaseError, getErrorTypeFromProcessed, shouldLogError, getRetryRecommendation, type ProcessedError } from "@/lib/error-handler";

export interface EnhancedErrorAlertProps {
  error?: any; // Raw Supabase error
  processedError?: ProcessedError; // Pre-processed error
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  message?: string;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
  showIcon?: boolean;
  showRetryButton?: boolean;
  showTechnicalDetails?: boolean;
  variant?: "default" | "corporate";
  autoProcess?: boolean; // Whether to automatically process raw errors
}

const alertVariants = {
  error: {
    icon: XCircle,
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
    titleColor: "text-red-900",
    buttonColor: "bg-red-600 hover:bg-red-700 text-white",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
    titleColor: "text-green-900",
    buttonColor: "bg-green-600 hover:bg-green-700 text-white",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-900",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-500",
    titleColor: "text-blue-900",
    buttonColor: "bg-blue-600 hover:bg-blue-700 text-white",
  },
};

const corporateAlertVariants = {
  error: {
    icon: XCircle,
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
    titleColor: "text-red-900",
    buttonColor: "bg-red-600 hover:bg-red-700 text-white",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
    titleColor: "text-green-900",
    buttonColor: "bg-green-600 hover:bg-green-700 text-white",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-900",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  info: {
    icon: Info,
    bgColor: "bg-gradient-to-r from-[#cce0ff] to-[#66a3ff] border-[#007acc]",
    textColor: "text-[#003366]",
    iconColor: "text-[#007acc]",
    titleColor: "text-[#003366]",
    buttonColor: "corporate-gradient hover:opacity-90 text-white",
  },
};

export function EnhancedErrorAlert({
  error,
  processedError,
  type,
  title,
  message,
  onClose,
  onRetry,
  className,
  showIcon = true,
  showRetryButton = false,
  showTechnicalDetails = false,
  variant = "default",
  autoProcess = true,
}: EnhancedErrorAlertProps) {
  // Process the error if needed
  let finalProcessedError: ProcessedError | null = null;
  let finalType = type;
  let finalTitle = title;
  let finalMessage = message;

  if (autoProcess && error && !processedError) {
    finalProcessedError = processSupabaseError(error);
    finalType = finalType || getErrorTypeFromProcessed(finalProcessedError);
    finalTitle = finalTitle || getDefaultTitle(finalProcessedError);
    finalMessage = finalMessage || finalProcessedError.userMessage;
  } else if (processedError) {
    finalProcessedError = processedError;
    finalType = finalType || getErrorTypeFromProcessed(finalProcessedError);
    finalTitle = finalTitle || getDefaultTitle(finalProcessedError);
    finalMessage = finalMessage || finalProcessedError.userMessage;
  }

  // Log critical errors
  if (finalProcessedError && shouldLogError(finalProcessedError)) {
    console.error('Critical Error:', {
      processed: finalProcessedError,
      original: error
    });
  }

  const alertConfig = variant === "default" ? alertVariants[finalType || "error"] : corporateAlertVariants[finalType || "error"];
  const Icon = alertConfig.icon;

  // Determine if we should show retry button
  const shouldShowRetry = showRetryButton && (
    finalProcessedError?.type === 'network' || 
    finalProcessedError?.type === 'unknown' ||
    getRetryRecommendation(finalProcessedError!)
  );

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 transition-all duration-200",
        alertConfig.bgColor,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", alertConfig.iconColor)} aria-hidden="true" />
          </div>
        )}
        
        <div className={cn("ml-3 flex-1", showIcon ? "" : "ml-0")}>
          {finalTitle && (
            <h3 className={cn("text-sm font-medium", alertConfig.titleColor)}>
              {finalTitle}
            </h3>
          )}
          <div className={cn("text-sm", alertConfig.textColor, finalTitle ? "mt-1" : "")}>
            {finalMessage}
          </div>

          {/* Suggested Action */}
          {finalProcessedError?.suggestedAction && (
            <div className={cn("text-xs mt-2", alertConfig.textColor, "opacity-75")}>
              💡 {finalProcessedError.suggestedAction}
            </div>
          )}

          {/* Retry Recommendation */}
          {getRetryRecommendation(finalProcessedError!) && (
            <div className={cn("text-xs mt-2", alertConfig.textColor, "opacity-75")}>
              🔄 {getRetryRecommendation(finalProcessedError!)}
            </div>
          )}

          {/* Technical Details (for debugging) */}
          {showTechnicalDetails && finalProcessedError && (
            <details className="mt-3">
              <summary className={cn("text-xs cursor-pointer", alertConfig.textColor, "opacity-75")}>
                Technical Details
              </summary>
              <div className={cn("text-xs mt-2 p-2 bg-black/5 rounded", alertConfig.textColor, "opacity-75")}>
                <div><strong>Type:</strong> {finalProcessedError.type}</div>
                <div><strong>Category:</strong> {finalProcessedError.category}</div>
                <div><strong>Severity:</strong> {finalProcessedError.severity}</div>
                <div><strong>Technical:</strong> {finalProcessedError.technicalMessage}</div>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            {shouldShowRetry && onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  alertConfig.buttonColor
                )}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </button>
            )}
            
            {finalProcessedError?.suggestedAction && finalProcessedError.suggestedAction.includes('Contact support') && (
              <button
                onClick={() => window.open('mailto:support@yourapp.com', '_blank')}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  "bg-gray-600 hover:bg-gray-700 text-white"
                )}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Contact Support
              </button>
            )}
          </div>
        </div>
        
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
                  alertConfig.iconColor,
                  "hover:bg-black/5 focus:ring-offset-white"
                )}
                aria-label="Close alert"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get default title based on processed error
function getDefaultTitle(processedError: ProcessedError): string {
  switch (processedError.type) {
    case 'auth':
      return 'Authentication Error';
    case 'database':
      return 'Database Error';
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Validation Error';
    default:
      return 'Error';
  }
}

// Specialized components for common use cases
export function SupabaseErrorAlert({ 
  error, 
  onClose, 
  onRetry,
  showRetryButton = true,
  showTechnicalDetails = false 
}: { 
  error: any; 
  onClose?: () => void; 
  onRetry?: () => void;
  showRetryButton?: boolean;
  showTechnicalDetails?: boolean;
}) {
  return (
    <EnhancedErrorAlert
      error={error}
      onClose={onClose}
      onRetry={onRetry}
      showRetryButton={showRetryButton}
      showTechnicalDetails={showTechnicalDetails}
      variant="corporate"
      autoProcess={true}
    />
  );
}

export function AuthErrorAlert({ 
  error, 
  onClose, 
  onRetry 
}: { 
  error: any; 
  onClose?: () => void; 
  onRetry?: () => void;
}) {
  return (
    <EnhancedErrorAlert
      error={error}
      onClose={onClose}
      onRetry={onRetry}
      showRetryButton={true}
      variant="corporate"
      autoProcess={true}
    />
  );
}

export function NetworkErrorAlert({ 
  onClose, 
  onRetry 
}: { 
  onClose?: () => void; 
  onRetry?: () => void;
}) {
  return (
    <EnhancedErrorAlert
      type="error"
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onClose={onClose}
      onRetry={onRetry}
      showRetryButton={true}
      variant="corporate"
    />
  );
}

export function ValidationErrorAlert({ 
  errors, 
  onClose 
}: { 
  errors: string[]; 
  onClose?: () => void;
}) {
  return (
    <EnhancedErrorAlert
      type="error"
      title="Please fix the following errors:"
      message={errors.join(', ')}
      onClose={onClose}
      variant="corporate"
    />
  );
}

export function PremiumFeatureAlert({ onClose }: { onClose?: () => void }) {
  return (
    <EnhancedErrorAlert
      type="info"
      title="Premium Feature"
      message="This feature is available with a Premium subscription. Upgrade now to unlock AI-powered insights and advanced analytics."
      onClose={onClose}
      variant="corporate"
    />
  );
}
