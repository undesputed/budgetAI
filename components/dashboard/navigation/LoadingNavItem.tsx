"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "./PremiumBadge";

interface LoadingNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isPremium?: boolean;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LoadingNavItem({
  href,
  icon: Icon,
  label,
  isPremium = false,
  isActive = false,
  isCollapsed = false,
  onClick,
  className
}: LoadingNavItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isCurrentActive = isActive || pathname === href || pathname.startsWith(href + "/");

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    // Don't show loading for current page
    if (isCurrentActive) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Use router.push for programmatic navigation with loading state
      await router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="relative">
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          "hover:bg-[#cce0ff] hover:text-[#003366]",
          isCurrentActive 
            ? "bg-[#007acc] text-white shadow-sm" 
            : "text-[#00509e] hover:text-[#003366]",
          isCollapsed ? "justify-center px-2" : "justify-start",
          isLoading && "pointer-events-none opacity-75",
          className
        )}
        aria-current={isCurrentActive ? "page" : undefined}
      >
        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="h-4 w-4 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <Icon 
          className={cn(
            "flex-shrink-0 transition-colors",
            isCurrentActive ? "text-white" : "text-[#007acc] group-hover:text-[#003366]",
            isCollapsed ? "h-5 w-5" : "h-4 w-4",
            isLoading && "opacity-50"
          )}
          aria-hidden="true"
        />
        
        {!isCollapsed && (
          <>
            <span className={cn("flex-1 truncate", isLoading && "opacity-50")}>
              {label}
            </span>
            {isPremium && (
              <PremiumBadge 
                size="sm" 
                className={cn(
                  "flex-shrink-0",
                  isCurrentActive ? "text-amber-300" : "text-amber-500",
                  isLoading && "opacity-50"
                )}
              />
            )}
          </>
        )}
        
        {isCollapsed && isPremium && (
          <div className="absolute -top-1 -right-1">
            <PremiumBadge size="sm" />
          </div>
        )}
      </Link>
    </div>
  );
}
