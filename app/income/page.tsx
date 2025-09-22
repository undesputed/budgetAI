import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { IncomeManagement } from "@/components/income/IncomeManagement";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { fetchIncomeDataWithErrorHandling, ensureIncomeCategories } from "@/lib/services/income-service";
import { ErrorHandler } from "@/lib/errors/error-handler";

export default async function IncomePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch initial data with enhanced error handling
  const dataResult = await fetchIncomeDataWithErrorHandling(user.id);
  
  // Ensure income categories exist
  await ensureIncomeCategories(user.id);

  // Check for authentication errors that should redirect
  if (dataResult.errors.general) {
    const redirectInfo = ErrorHandler.shouldRedirect(dataResult.errors.general);
    if (redirectInfo.shouldRedirect) {
      redirect(redirectInfo.path!);
    }
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Income", isActive: true }
      ]}
    >
      <ErrorBoundary>
        <IncomeManagement 
          user={user}
          initialData={dataResult}
        />
      </ErrorBoundary>
    </DashboardLayout>
  );
}
