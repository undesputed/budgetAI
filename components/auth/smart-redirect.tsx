"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SmartRedirectProps {
  children: React.ReactNode;
  redirectTo: "login" | "signup" | "dashboard";
  fallbackTo?: "login" | "signup";
  className?: string;
  onClick?: () => void;
}

export function SmartRedirect({ 
  children, 
  redirectTo, 
  fallbackTo = "login",
  className,
  onClick 
}: SmartRedirectProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUser();
  }, [supabase.auth]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    setIsLoading(true);

    try {
      // If user is logged in and trying to access auth pages, redirect to dashboard
      if (user && (redirectTo === "login" || redirectTo === "signup")) {
        router.push("/dashboard");
        return;
      }

      // If user is not logged in and trying to access dashboard, redirect to auth
      if (!user && redirectTo === "dashboard") {
        router.push(`/auth/${fallbackTo}`);
        return;
      }

      // Normal redirect logic
      switch (redirectTo) {
        case "login":
          router.push("/auth/login");
          break;
        case "signup":
          router.push("/auth/signup");
          break;
        case "dashboard":
          router.push("/dashboard");
          break;
      }
    } catch (error) {
      console.error("Redirect error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking user
  if (isChecking) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <div 
      className={className}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// Convenience components for common use cases
export function SignInButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SmartRedirect redirectTo="login" className={className}>
      {children}
    </SmartRedirect>
  );
}

export function GetStartedButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SmartRedirect redirectTo="signup" className={className}>
      {children}
    </SmartRedirect>
  );
}

export function DashboardButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <SmartRedirect redirectTo="dashboard" fallbackTo="login" className={className}>
      {children}
    </SmartRedirect>
  );
}
