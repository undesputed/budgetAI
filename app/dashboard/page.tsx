import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { fetchDashboardData } from "@/lib/services/dashboard-server";
import { DashboardSkeleton } from "@/components/ui/skeleton-screens";
import { Suspense } from "react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch dashboard data from database
  const dashboardData = await fetchDashboardData(user.id);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! Here's an overview of your finances."
      breadcrumbs={[
        { label: "Dashboard", isActive: true }
      ]}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent 
          user={user} 
          dashboardData={dashboardData}
        />
      </Suspense>
    </DashboardLayout>
  );
}
