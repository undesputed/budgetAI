"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SuccessAlert } from "@/components/ui/success-alert";
import { SupabaseErrorAlert } from "@/components/ui/enhanced-error-alert";
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError(userError);
          setIsLoading(false);
          return;
        }

        if (user) {
          setUserEmail(user.email || "");
          
          // Check if email is confirmed
          if (user.email_confirmed_at) {
            setSuccess(true);
          } else {
            setError({
              message: "Email not yet confirmed. Please check your email and click the confirmation link.",
              code: "email_not_confirmed"
            });
          }
        } else {
          setError({
            message: "No user session found. Please sign in first.",
            code: "no_session"
          });
        }
      } catch (err) {
        console.error('Error checking email confirmation:', err);
        setError({
          message: 'An unexpected error occurred. Please try again.',
          code: 'unexpected_error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkEmailConfirmation();
  }, []);

  const handleResendConfirmation = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail
      });

      if (error) {
        setError(error);
      } else {
        setError({
          message: "Confirmation email sent! Please check your inbox.",
          code: "resend_success"
        });
      }
      } catch {
        setError({
          message: 'Failed to resend confirmation email. Please try again.',
          code: 'resend_error'
        });
      }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-xl border border-[#cce0ff] p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-[#007acc] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#003366] mb-2">
              Checking Email Status
            </h1>
            <p className="text-[#00509e]">
              Please wait while we verify your email confirmation status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-xl border border-[#cce0ff] p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#003366] mb-2">
              Email Confirmed!
            </h1>
            <p className="text-[#00509e] mb-6">
              Your email has been successfully confirmed. Welcome to BudgetAI!
            </p>
            
            <SuccessAlert
              variant="success"
              message="Your account is now fully activated. You can access all features of BudgetAI."
              onClose={() => {}}
            />
            
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full corporate-gradient text-white hover:opacity-90 transition-all duration-300"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="w-full border-[#007acc] text-[#007acc] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isResendSuccess = error.code === "resend_success";
    
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-xl border border-[#cce0ff] p-8">
            <div className="flex justify-center mb-4">
              {isResendSuccess ? (
                <Mail className="h-12 w-12 text-[#007acc]" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-[#003366] mb-4 text-center">
              {isResendSuccess ? "Email Sent!" : "Email Not Confirmed"}
            </h1>
            
            {isResendSuccess ? (
              <SuccessAlert
                variant="success"
                message="Please check your email inbox and click the confirmation link to activate your account."
                onClose={() => {}}
              />
            ) : (
              <SupabaseErrorAlert 
                error={error} 
                onClose={() => setError(null)}
                showRetryButton={false}
              />
            )}
            
            <div className="mt-6 space-y-3">
              {!isResendSuccess && (
                <Button
                  onClick={handleResendConfirmation}
                  className="w-full corporate-gradient text-white hover:opacity-90 transition-all duration-300"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Confirmation Email
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="w-full border-[#007acc] text-[#007acc] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors"
              >
                Go to Login
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/auth/signup")}
                className="w-full border-[#007acc] text-[#007acc] hover:bg-[#cce0ff] hover:text-[#003366] transition-colors"
              >
                Try Signing Up Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
