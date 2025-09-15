"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "./PremiumBadge";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isPremium?: boolean;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavItem({
  href,
  icon: Icon,
  label,
  isPremium = false,
  isActive = false,
  isCollapsed = false,
  onClick,
  className
}: NavItemProps) {
  const pathname = usePathname();
  const isCurrentActive = isActive || pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        "hover:bg-[#cce0ff] hover:text-[#003366]",
        isCurrentActive 
          ? "bg-[#007acc] text-white shadow-sm" 
          : "text-[#00509e] hover:text-[#003366]",
        isCollapsed ? "justify-center px-2" : "justify-start",
        className
      )}
      aria-current={isCurrentActive ? "page" : undefined}
    >
      <Icon 
        className={cn(
          "flex-shrink-0 transition-colors",
          isCurrentActive ? "text-white" : "text-[#007acc] group-hover:text-[#003366]",
          isCollapsed ? "h-5 w-5" : "h-4 w-4"
        )}
        aria-hidden="true"
      />
      
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {isPremium && (
            <PremiumBadge 
              size="sm" 
              className={cn(
                "flex-shrink-0",
                isCurrentActive ? "text-amber-300" : "text-amber-500"
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
  );
}
