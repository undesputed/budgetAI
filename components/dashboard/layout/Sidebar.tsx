"use client";

import { useState, useEffect } from "react";
import { 
  Home,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  CreditCard as CreditCardIcon,
  FileText,
  Settings,
  Tag,
  CreditCard,
  Building2,
  Brain,
  Calendar,
  Clock,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavGroup } from "../navigation/NavGroup";
import { LoadingNavItem } from "../navigation/LoadingNavItem";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function Sidebar({ isCollapsed, className }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation groups and items
  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { href: "/dashboard", icon: Home, label: "Dashboard" },
        { href: "/analytics", icon: BarChart3, label: "Analytics" }
      ]
    },
    {
      title: "Transactions",
      items: [
        { href: "/expenses", icon: TrendingDown, label: "Expenses" },
        { href: "/income", icon: TrendingUp, label: "Income" },
        { href: "/transfers", icon: ArrowLeftRight, label: "Transfers" },
        { href: "/payments", icon: CreditCardIcon, label: "Payments" }
      ]
    },
    {
      title: "Management",
      items: [
        { href: "/categories", icon: Tag, label: "Categories" },
        { href: "/credit-cards", icon: CreditCard, label: "Credit Cards" },
        { href: "/bank-accounts", icon: Building2, label: "Bank Accounts" }
      ]
    },
    {
      title: "Premium Features",
      items: [
        { href: "/budget-assistance", icon: Brain, label: "Budget Assistance", isPremium: true },
        { href: "/calendar", icon: Calendar, label: "Calendar", isPremium: true },
        { href: "/scheduled-payments", icon: Clock, label: "Scheduled Payments", isPremium: true }
      ]
    }
  ];

  const standaloneItems = [
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" }
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-white border-r border-[#cce0ff] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        isMobile && !isCollapsed && "w-64",
        isMobile && isCollapsed && "w-0 overflow-hidden",
        className
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#cce0ff]">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#007acc] flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-[#003366]">BudgetAI</span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#003366] to-[#007acc] flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Navigation Groups */}
          {navigationGroups.map((group) => (
            <NavGroup
              key={group.title}
              title={group.title}
              items={group.items}
              isCollapsed={isCollapsed}
              defaultOpen={!isCollapsed}
            />
          ))}

          {/* Standalone Items */}
          <div className="space-y-1">
            {standaloneItems.map((item) => (
              <LoadingNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#cce0ff] p-3">
          <div className="text-xs text-[#00509e] text-center">
            {!isCollapsed && (
              <div className="space-y-1">
                <div>BudgetAI v1.0</div>
                <div>© 2024 All rights reserved</div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center">
                <div className="h-2 w-2 rounded-full bg-[#007acc]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
