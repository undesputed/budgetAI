"use client";

import { useState } from "react";
import { 
  Search, 
  Bell, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalculatorButton } from "../calculator/CalculatorButton";
import { Calculator } from "../calculator/Calculator";
import { ProfileDropdown } from "../profile/ProfileDropdown";

interface TopNavProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    subscription_tier?: string;
  };
  className?: string;
}

export function TopNav({ 
  isSidebarCollapsed, 
  onToggleSidebar, 
  user,
  className 
}: TopNavProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  // Mobile detection is handled by CSS media queries

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 bg-white border-b border-[#cce0ff] transition-all duration-300",
          isSidebarCollapsed ? "left-16" : "left-64",
          "lg:left-64 lg:right-0",
          "md:left-16 md:right-0",
          "sm:left-0 sm:right-0",
          className
        )}
        aria-label="Top navigation"
      >
        <div className="flex h-full items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden text-[#00509e] hover:text-[#003366] hover:bg-[#cce0ff]"
              aria-label="Toggle sidebar"
            >
              {isSidebarCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </Button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#007acc]" />
                <Input
                  type="text"
                  placeholder="Search transactions, budgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    "w-64 pl-10 pr-4 py-2 border-[#cce0ff] focus:border-[#007acc] focus:ring-[#007acc] transition-all duration-200",
                    isSearchFocused && "w-80",
                    "sm:w-48 sm:focus:w-64"
                  )}
                />
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Calculator Button */}
            <CalculatorButton onClick={() => setShowCalculator(true)} />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-[#00509e] hover:text-[#003366] hover:bg-[#cce0ff]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Profile */}
            <ProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* Calculator Modal */}
      <Calculator 
        isOpen={showCalculator} 
        onClose={() => setShowCalculator(false)} 
      />
    </>
  );
}
