"use client";

/**
 * Success Alert Components
 * 
 * This file provides reusable success components for displaying success messages
 * throughout the application. It includes both alert-style and dialog-style components.
 * 
 * Usage Examples:
 * 
 * 1. Simple Success Alert:
 *    <SuccessAlert message="Operation completed successfully!" />
 * 
 * 2. Auth Success Alert (with Corporate Blues theme):
 *    <AuthSuccessAlert message="Login successful!" onClose={() => setShowAlert(false)} />
 * 
 * 3. Signup Success Dialog:
 *    <SignupSuccessDialog 
 *      isOpen={showDialog} 
 *      onClose={() => setShowDialog(false)} 
 *      onGoToLogin={() => router.push('/auth/login')} 
 *    />
 * 
 * 4. General Success Dialog:
 *    <GeneralSuccessDialog
 *      isOpen={showDialog}
 *      onClose={() => setShowDialog(false)}
 *      title="Profile Updated!"
 *      message="Your profile has been updated successfully."
 *      actionButtonText="Continue"
 *      onActionClick={() => router.push('/dashboard')}
 *    />
 * 
 * 5. Custom Success Dialog:
 *    <SuccessDialog
 *      isOpen={showDialog}
 *      onClose={() => setShowDialog(false)}
 *      title="Custom Title"
 *      message="Custom message"
 *      actionButtonText="Custom Action"
 *      actionButtonHref="/custom-route"
 *      showEmailIcon={true}
 *      variant="info"
 *    />
 */

import { useState, useEffect } from "react";
import { CheckCircle, X, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Success Alert Component (similar to error alert)
interface SuccessAlertProps {
  message: string;
  onClose?: () => void;
  variant?: "default" | "success" | "info";
  className?: string;
}

export function SuccessAlert({ 
  message, 
  onClose, 
  variant = "success",
  className = "" 
}: SuccessAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds if no onClose handler
    if (!onClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "info":
        return "bg-[#cce0ff] border-[#66a3ff] text-[#003366]";
      case "success":
      default:
        return "bg-green-50 border-green-200 text-green-800";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "info":
        return "text-[#007acc]";
      case "success":
      default:
        return "text-green-600";
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getVariantStyles()} ${className}`}>
      <div className="flex items-start">
        <CheckCircle className={`h-5 w-5 mr-3 mt-0.5 ${getIconColor()}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Success Dialog Component
interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  actionButtonText?: string;
  actionButtonHref?: string;
  onActionClick?: () => void;
  showEmailIcon?: boolean;
  variant?: "default" | "signup" | "info";
}

export function SuccessDialog({
  isOpen,
  onClose,
  title = "Success!",
  message,
  actionButtonText = "Continue",
  actionButtonHref,
  onActionClick,
  showEmailIcon = false,
  variant = "default"
}: SuccessDialogProps) {
  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    }
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "signup":
        return {
          icon: "text-[#007acc]",
          button: "corporate-gradient text-white hover:opacity-90",
          title: "text-[#003366]",
          message: "text-[#00509e]"
        };
      case "info":
        return {
          icon: "text-[#007acc]",
          button: "bg-[#007acc] text-white hover:bg-[#00509e]",
          title: "text-[#003366]",
          message: "text-[#00509e]"
        };
      default:
        return {
          icon: "text-green-600",
          button: "bg-green-600 text-white hover:bg-green-700",
          title: "text-gray-900",
          message: "text-gray-600"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md corporate-shadow-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle className={`h-8 w-8 ${styles.icon}`} />
            </div>
          </div>
          <DialogTitle className={`text-xl font-semibold ${styles.title}`}>
            {title}
          </DialogTitle>
          <DialogDescription className={`text-center ${styles.message}`}>
            {message}
          </DialogDescription>
        </DialogHeader>

        {showEmailIcon && (
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-[#cce0ff] p-3">
              <Mail className="h-6 w-6 text-[#007acc]" />
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-[#e2e8f0] text-[#00509e] hover:bg-[#f8fafc]"
          >
            Close
          </Button>
          {actionButtonHref ? (
            <Button
              onClick={handleActionClick}
              className={`w-full sm:w-auto ${styles.button} transition-all duration-300`}
              asChild
            >
              <a href={actionButtonHref} className="flex items-center justify-center">
                {actionButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button
              onClick={handleActionClick}
              className={`w-full sm:w-auto ${styles.button} transition-all duration-300`}
            >
              {actionButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Convenience components for common use cases
export function AuthSuccessAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <SuccessAlert 
      message={message} 
      onClose={onClose}
      variant="info"
      className="corporate-shadow"
    />
  );
}

export function SignupSuccessDialog({ 
  isOpen, 
  onClose, 
  onGoToLogin 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onGoToLogin: () => void;
}) {
  return (
    <SuccessDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Account Created Successfully!"
      message="Your account has been created successfully. Please check your email and click the confirmation link to complete your registration."
      actionButtonText="Go to Login"
      onActionClick={onGoToLogin}
      showEmailIcon={true}
      variant="signup"
    />
  );
}

export function GeneralSuccessDialog({
  isOpen,
  onClose,
  title,
  message,
  actionButtonText,
  onActionClick
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  actionButtonText?: string;
  onActionClick?: () => void;
}) {
  return (
    <SuccessDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      actionButtonText={actionButtonText}
      onActionClick={onActionClick}
      variant="default"
    />
  );
}
