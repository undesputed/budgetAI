"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "../navigation/Breadcrumb";

interface ContentAreaProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
  showBreadcrumbs?: boolean;
  className?: string;
  headerActions?: ReactNode;
}

export function ContentArea({
  children,
  title,
  subtitle,
  breadcrumbs,
  showBreadcrumbs = true,
  className,
  headerActions
}: ContentAreaProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto bg-[#f8fafc] transition-all duration-300",
        className
      )}
    >
      <div className="h-full">
        {/* Header Section */}
        {(title || showBreadcrumbs) && (
          <div className="bg-white border-b border-[#cce0ff] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {/* Breadcrumbs */}
                {showBreadcrumbs && (
                  <Breadcrumb items={breadcrumbs} />
                )}
                
                {/* Page Title */}
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold text-[#003366]">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-[#00509e] text-sm mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Header Actions */}
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </main>
  );
}
