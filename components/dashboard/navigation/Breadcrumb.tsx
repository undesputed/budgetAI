"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route mapping for automatic breadcrumb generation
const routeLabels: { [key: string]: string } = {
  dashboard: "Dashboard",
  expenses: "Expenses",
  income: "Income",
  transfers: "Transfers",
  payments: "Payments",
  reports: "Reports",
  settings: "Settings",
  categories: "Categories",
  "credit-cards": "Credit Cards",
  "bank-accounts": "Bank Accounts",
  "budget-assistance": "Budget Assistance",
  calendar: "Calendar",
  "scheduled-payments": "Scheduled Payments",
  profile: "Profile",
  notifications: "Notifications",
  billing: "Billing",
  analytics: "Analytics",
  charts: "Charts"
};

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home if requested
    if (showHome) {
      breadcrumbs.push({
        label: "Dashboard",
        href: "/dashboard"
      });
    }

    // Generate breadcrumbs from path segments
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href: isLast ? undefined : currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={cn("flex items-center space-x-1 text-sm", className)}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index === 0 && showHome && (
            <Home className="h-4 w-4 text-[#007acc] mr-1" />
          )}
          
          {item.href && !item.isActive ? (
            <Link
              href={item.href}
              className="text-[#00509e] hover:text-[#003366] transition-colors duration-200 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "font-medium",
                item.isActive ? "text-[#003366]" : "text-[#00509e]"
              )}
              aria-current={item.isActive ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
          
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="h-4 w-4 text-[#007acc] mx-2 flex-shrink-0" />
          )}
        </div>
      ))}
    </nav>
  );
}
