"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SupabaseErrorAlert } from "@/components/ui/enhanced-error-alert";
import { SuccessAlert } from "@/components/ui/success-alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient();
        
        // Get the URL hash and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParamsObj = new URLSearchParams(window.location.search);
        
        // Check for error in URL params
        const errorParam = searchParamsObj.get('error') || hashParams.get('error');
        const errorDescription = searchParamsObj.get('error_description') || hashParams.get('error_description');
        
        if (errorParam) {
          setError({
            message: errorDescription || 'Authentication failed',
            code: errorParam
          });
          setIsLoading(false);
          return;
        }

        // Handle the auth callback
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Auth callback error:', authError);
          setError(authError);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          // Check if this is an email confirmation
          const isEmailConfirmation = searchParamsObj.get('type') === 'signup' || 
                                    hashParams.get('type') === 'signup';
          
          if (isEmailConfirmation) {
            setSuccess(true);
            setMessage("Email confirmed successfully! Welcome to BudgetAI!");
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          } else {
            // Regular login, redirect immediately
            router.push("/dashboard");
          }
        } else {
          // No session, redirect to login
          router.push("/auth/login");
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError({
          message: 'An unexpected error occurred. Please try again.',
          code: 'unexpected_error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-xl border border-[#cce0ff] p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-[#007acc] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#003366] mb-2">
              Confirming Your Account
            </h1>
            <p className="text-[#00509e]">
              Please wait while we verify your email confirmation...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-xl border border-[#cce0ff] p-8">
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#003366] mb-4 text-center">
              Confirmation Failed
            </h1>
            
            <SupabaseErrorAlert 
              error={error} 
              onClose={() => setError(null)}
              showRetryButton={false}
            />
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-[#007acc] text-white py-2 px-4 rounded-lg hover:bg-[#00509e] transition-colors duration-200"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push("/auth/signup")}
                className="w-full bg-white text-[#007acc] py-2 px-4 rounded-lg border border-[#007acc] hover:bg-[#cce0ff] transition-colors duration-200"
              >
                Try Signing Up Again
              </button>
            </div>
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
              {message}
            </p>
            
            <SuccessAlert
              variant="success"
              message="Your account has been successfully activated. You can now access all features of BudgetAI."
              onClose={() => {}}
            />
            
            <div className="mt-6">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-[#007acc] text-white py-2 px-4 rounded-lg hover:bg-[#00509e] transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            </div>
            
            <p className="text-sm text-[#00509e] mt-4">
              You will be automatically redirected in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
