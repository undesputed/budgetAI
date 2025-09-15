"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingOverlay } from "./skeleton-screens";

// =============================================
// PAGE LOADING COMPONENTS
// =============================================
// Components for handling page loading states

interface PageLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number; // Delay before showing loading (in ms)
}

export function PageLoading({ 
  children, 
  fallback = <LoadingOverlay message="Loading page..." />, 
  delay = 200 
}: PageLoadingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Start loading state
    setIsLoading(true);
    
    // Show loading after delay to avoid flash for fast loads
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowLoading(true);
      }
    }, delay);

    // Clean up timer
    return () => {
      clearTimeout(timer);
      setIsLoading(false);
      setShowLoading(false);
    };
  }, [pathname, delay, isLoading]);

  // Hide loading when component mounts (page loaded)
  useEffect(() => {
    setIsLoading(false);
    setShowLoading(false);
  }, []);

  if (showLoading && isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// =============================================
// NAVIGATION LOADING HOOK
// =============================================

export function useNavigationLoading() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationPath, setNavigationPath] = useState<string | null>(null);

  const startNavigation = (path: string) => {
    setIsNavigating(true);
    setNavigationPath(path);
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setNavigationPath(null);
  };

  return {
    isNavigating,
    navigationPath,
    startNavigation,
    endNavigation
  };
}

// =============================================
// LOADING BUTTON COMPONENT
// =============================================

interface LoadingButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export function LoadingButton({ 
  children, 
  onClick, 
  isLoading = false, 
  loadingText = "Loading...",
  className = "",
  disabled = false
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// =============================================
// PROGRESSIVE LOADING COMPONENT
// =============================================

interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  totalSteps: number;
  message?: string;
}

export function ProgressiveLoading({ 
  steps, 
  currentStep, 
  totalSteps, 
  message = "Loading..." 
}: ProgressiveLoadingProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg w-80">
        <div className="space-y-4">
          <div className="text-center">
            <div className="h-6 w-6 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <h3 className="text-[#003366] font-medium">{message}</h3>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#007acc] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step indicator */}
          <div className="text-center text-sm text-[#00509e]">
            Step {currentStep} of {totalSteps}
          </div>
          
          {/* Current step */}
          {steps[currentStep - 1] && (
            <div className="text-center text-xs text-gray-600">
              {steps[currentStep - 1]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
