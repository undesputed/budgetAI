"use client";

import { useState } from "react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { ExpenseIncomeBreakdown } from "@/components/analytics/sections/ExpenseIncomeBreakdown";
import { TransactionTrends } from "@/components/analytics/sections/TransactionTrends";
import { CreditCardBankUsage } from "@/components/analytics/sections/CreditCardBankUsage";
import { RecurringPaymentsInstallments } from "@/components/analytics/sections/RecurringPaymentsInstallments";
import { BudgetVsActuals } from "@/components/analytics/sections/BudgetVsActuals";
import { CategoryInsights } from "@/components/analytics/sections/CategoryInsights";
import type { 
  AnalyticsData,
  AnalyticsFilters as AnalyticsFiltersType
} from "@/lib/services/analytics-server";

interface AnalyticsContentProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  analyticsData: AnalyticsData;
  filters: AnalyticsFiltersType;
}

export function AnalyticsContent({ user, analyticsData, filters }: AnalyticsContentProps) {
  const [error, setError] = useState<string | null>(analyticsData.error);
  const [currentFilters, setCurrentFilters] = useState<AnalyticsFiltersType>(filters);

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  const handleFiltersChange = (newFilters: AnalyticsFiltersType) => {
    setCurrentFilters(newFilters);
    // Update URL with new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    window.history.pushState({}, '', `/analytics?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#cce0ff]/30 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorAlert message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#cce0ff]/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Welcome to Analytics, {userName}!
          </h1>
          <p className="text-[#00509e] text-lg">
            Deep insights into your financial data and trends
          </p>
        </div>

        {/* Global Filters */}
        <div className="mb-8">
          <AnalyticsFilters 
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            analyticsData={analyticsData}
          />
        </div>

        {/* Analytics Sections */}
        <div className="space-y-8">
          {/* Section 1: Expense & Income Breakdown */}
          <ExpenseIncomeBreakdown 
            categorySpending={analyticsData.categorySpending}
            monthlyTransactions={analyticsData.monthlyTransactions}
          />

          {/* Section 2: Transaction Trends */}
          <TransactionTrends 
            monthlyTransactions={analyticsData.monthlyTransactions}
            highValueTransactions={analyticsData.highValueTransactions}
          />

          {/* Section 3: Credit Card & Bank Usage */}
          <CreditCardBankUsage 
            creditCardUsage={analyticsData.creditCardUsage}
            bankAccounts={analyticsData.bankAccounts}
          />

          {/* Section 4: Recurring Payments & Installments */}
          <RecurringPaymentsInstallments 
            recurringPayments={analyticsData.recurringPayments}
            installments={analyticsData.installments}
          />

          {/* Section 5: Budget vs Actuals */}
          <BudgetVsActuals 
            budgetVsActual={analyticsData.budgetVsActual}
          />

          {/* Section 6: Category Insights */}
          <CategoryInsights 
            categorySpending={analyticsData.categorySpending}
            highValueTransactions={analyticsData.highValueTransactions}
          />
        </div>
      </div>
    </div>
  );
}
