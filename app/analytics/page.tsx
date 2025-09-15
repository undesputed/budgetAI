import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { AnalyticsContent } from "@/components/analytics/analytics-content";
import { fetchAnalyticsData } from "@/lib/services/analytics-server";
import { AnalyticsSkeleton } from "@/components/ui/skeleton-screens";
import { Suspense } from "react";

interface AnalyticsPageProps {
  searchParams: Promise<{
    period?: string;
    account?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user has premium subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.subscription_tier !== 'premium' || profile.subscription_status !== 'active') {
    redirect("/dashboard?error=premium_required");
  }

  // Fetch analytics data with filters
  const analyticsData = await fetchAnalyticsData(user.id, {
    period: (params.period as 'week' | 'month' | 'quarter' | 'year' | 'custom') || 'month',
    account: params.account || 'all',
    category: params.category || 'all',
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Deep insights into your financial data and trends"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Analytics", isActive: true }
      ]}
    >
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent 
          user={user} 
          analyticsData={analyticsData}
          filters={{
            period: (params.period as 'week' | 'month' | 'quarter' | 'year' | 'custom') || 'month',
            account: params.account || 'all',
            category: params.category || 'all',
            startDate: params.startDate,
            endDate: params.endDate,
          }}
        />
      </Suspense>
    </DashboardLayout>
  );
}
