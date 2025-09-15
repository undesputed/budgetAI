"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PremiumBadge({ className, size = "sm" }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <Crown 
      className={cn(
        "text-amber-500 fill-amber-500",
        sizeClasses[size],
        className
      )}
      aria-label="Premium feature"
    />
  );
}
