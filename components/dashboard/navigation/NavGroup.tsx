"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingNavItem } from "./LoadingNavItem";

interface NavGroupItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isPremium?: boolean;
}

interface NavGroupProps {
  title: string;
  items: NavGroupItem[];
  isCollapsed?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function NavGroup({
  title,
  items,
  isCollapsed = false,
  defaultOpen = true,
  className
}: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return (
      <div className={cn("space-y-1", className)}>
        {items.map((item) => (
          <LoadingNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isPremium={item.isPremium}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider",
          "text-[#00509e] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors duration-200"
        )}
        aria-expanded={isOpen}
        aria-controls={`nav-group-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="flex-1 truncate">{title}</span>
      </button>
      
      <div
        id={`nav-group-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className={cn(
          "space-y-1 overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {items.map((item) => (
          <LoadingNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isPremium={item.isPremium}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
}
