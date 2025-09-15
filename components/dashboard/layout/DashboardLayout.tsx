"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { ContentArea } from "./ContentArea";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
  showBreadcrumbs?: boolean;
  headerActions?: ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  showBreadcrumbs = true,
  headerActions,
  className
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    subscription_tier?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Check authentication and get user data
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error || !authUser) {
          router.push("/auth/login");
          return;
        }

        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Still allow access with basic user data
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            full_name: authUser.user_metadata?.full_name,
            avatar_url: authUser.user_metadata?.avatar_url,
            subscription_tier: "free"
          });
        } else {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            subscription_tier: profile.subscription_tier || "free"
          });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#007acc] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#00509e]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <div className={cn("min-h-screen bg-[#f8fafc]", className)}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
      />

      {/* Top Navigation */}
      <TopNav 
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        user={user}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "ml-16" : "ml-64",
          "lg:ml-64",
          "md:ml-16",
          "sm:ml-0"
        )}
      >
        <div className="pt-16 h-screen">
          <ContentArea
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            showBreadcrumbs={showBreadcrumbs}
            headerActions={headerActions}
          >
            {children}
          </ContentArea>
        </div>
      </div>
    </div>
  );
}
