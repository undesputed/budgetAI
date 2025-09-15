"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  ChevronDown,
  CreditCard,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ProfileDropdownProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    subscription_tier?: string;
  };
  className?: string;
}

export function ProfileDropdown({ user, className }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleUpgrade = () => {
    // TODO: Implement subscription upgrade flow
    console.log("Upgrade subscription");
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const getSubscriptionBadgeColor = (tier?: string) => {
    switch (tier) {
      case "premium":
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      case "free":
      default:
        return "bg-[#cce0ff] text-[#003366]";
    }
  };

  const getSubscriptionLabel = (tier?: string) => {
    switch (tier) {
      case "premium":
        return "Premium";
      case "free":
      default:
        return "Free";
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 h-auto text-[#00509e] hover:text-[#003366] hover:bg-[#cce0ff] transition-colors duration-200",
          isOpen && "bg-[#cce0ff] text-[#003366]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="relative">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name || user.email}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#007acc] flex items-center justify-center text-white text-sm font-medium">
              {getInitials(user.full_name, user.email)}
            </div>
          )}
          
          {/* Subscription status indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
            user.subscription_tier === "premium" ? "bg-amber-500" : "bg-[#007acc]"
          )} />
        </div>

        {/* User info */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium truncate max-w-32">
            {user.full_name || user.email.split("@")[0]}
          </div>
          <div className="text-xs text-[#00509e] truncate max-w-32">
            {user.email}
          </div>
        </div>

        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-[#cce0ff] py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-[#cce0ff]">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#007acc] flex items-center justify-center text-white font-medium">
                  {getInitials(user.full_name, user.email)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#003366] truncate">
                  {user.full_name || user.email.split("@")[0]}
                </div>
                <div className="text-xs text-[#00509e] truncate">
                  {user.email}
                </div>
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1",
                  getSubscriptionBadgeColor(user.subscription_tier)
                )}>
                  {user.subscription_tier === "premium" && <Crown className="h-3 w-3" />}
                  {getSubscriptionLabel(user.subscription_tier)}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/profile");
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#00509e] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors duration-200"
            >
              <User className="h-4 w-4" />
              Profile Settings
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/settings");
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#00509e] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors duration-200"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/notifications");
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#00509e] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors duration-200"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>

            {user.subscription_tier === "free" && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleUpgrade();
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors duration-200"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Premium
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/billing");
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#00509e] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors duration-200"
            >
              <CreditCard className="h-4 w-4" />
              Billing & Subscription
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-[#cce0ff] pt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
