"use client";

import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorAlertProps {
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "destructive" | "outline";
}

const alertVariants = {
  error: {
    icon: XCircle,
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
    titleColor: "text-red-900",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
    titleColor: "text-green-900",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-900",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-500",
    titleColor: "text-blue-900",
  },
};

const corporateAlertVariants = {
  error: {
    icon: XCircle,
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-500",
    titleColor: "text-red-900",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-500",
    titleColor: "text-green-900",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-900",
  },
  info: {
    icon: Info,
    bgColor: "bg-gradient-to-r from-[#cce0ff] to-[#66a3ff] border-[#007acc]",
    textColor: "text-[#003366]",
    iconColor: "text-[#007acc]",
    titleColor: "text-[#003366]",
  },
};

export function ErrorAlert({
  type = "error",
  title,
  message,
  onClose,
  className,
  showIcon = true,
  variant = "default",
}: ErrorAlertProps) {
  const alertConfig = variant === "default" ? alertVariants[type] : corporateAlertVariants[type];
  const Icon = alertConfig.icon;

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
          {title && (
            <h3 className={cn("text-sm font-medium", alertConfig.titleColor)}>
              {title}
            </h3>
          )}
          <div className={cn("text-sm", alertConfig.textColor, title ? "mt-1" : "")}>
            {message}
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

// Specialized components for common use cases
export function AuthErrorAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <ErrorAlert
      type="error"
      title="Authentication Error"
      message={message}
      onClose={onClose}
      variant="default"
    />
  );
}

export function SuccessAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <ErrorAlert
      type="success"
      title="Success"
      message={message}
      onClose={onClose}
      variant="default"
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
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function NetworkErrorAlert({ onClose }: { onClose?: () => void }) {
  return (
    <ErrorAlert
      type="error"
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onClose={onClose}
      variant="default"
    />
  );
}

export function PremiumFeatureAlert({ onClose }: { onClose?: () => void }) {
  return (
    <ErrorAlert
      type="info"
      title="Premium Feature"
      message="This feature is available with a Premium subscription. Upgrade now to unlock AI-powered insights and advanced analytics."
      onClose={onClose}
      variant="default"
    />
  );
}
