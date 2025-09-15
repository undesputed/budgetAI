"use client";

import { useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { FinancialSummaryCard } from "@/components/dashboard/ui/FinancialSummaryCard";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { DynamicPieChart } from "@/components/dashboard/ui/DynamicPieChart";
import { DynamicLineChart } from "@/components/dashboard/ui/DynamicLineChart";
import { CreditCardItem } from "@/components/dashboard/ui/CreditCardItem";
import { 
  EmptyTransactions, 
  EmptyCreditCards, 
  EmptyInstallments, 
  EmptyRecurringPayments,
  EmptyExpenseCategories 
} from "@/components/dashboard/ui/EmptyState";
import type { 
  DashboardSummary,
  Transaction,
  CreditCard,
  Installment,
  RecurringPayment,
  ExpenseCategory,
  MonthlyTrend
} from "@/lib/services/dashboard-server";

interface DashboardData {
  summary: DashboardSummary;
  recentTransactions: Transaction[];
  creditCards: CreditCard[];
  installments: Installment[];
  recurringPayments: RecurringPayment[];
  expenseCategories: ExpenseCategory[];
  monthlyTrends: MonthlyTrend[];
  error: string | null;
}

interface DashboardContentProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  dashboardData: DashboardData;
}

export function DashboardContent({ user, dashboardData }: DashboardContentProps) {
  const [error, setError] = useState<string | null>(dashboardData.error);

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // Use real data from database
  const {
    summary: summaryData,
    recentTransactions,
    creditCards,
    installments,
    recurringPayments,
    expenseCategories,
    monthlyTrends
  } = dashboardData;

  // Table column configurations
  const expenseColumns = [
    { key: "date", label: "Date" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "description", label: "Description" }
  ];

  const installmentColumns = [
    { key: "item_name", label: "Item Name" },
    { key: "remaining_amount", label: "Remaining", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "due_date", label: "Due Date" }
  ];

  const paymentColumns = [
    { key: "payment_type", label: "Payment Type" },
    { key: "amount", label: "Amount", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "status", label: "Status", render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'paid' ? 'bg-green-100 text-green-800' :
        value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )}
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#cce0ff]/30">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4">
          <ErrorAlert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003366] mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-[#00509e]">
          Here&apos;s an overview of your financial dashboard.
        </p>
      </div>

      {/* Section 1: Total Summary (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <FinancialSummaryCard
          title="Total Expenses"
          value={`$${summaryData.totalExpenses.toFixed(2)}`}
          icon={ArrowDownRight}
          description="Monthly spending"
          trend={{ value: -5.2, isPositive: false }}
        />
        <FinancialSummaryCard
          title="Total No. of Transactions"
          value={summaryData.totalTransactions}
          icon={TrendingUp}
          description="Transaction count"
          trend={{ value: 12.5, isPositive: true }}
        />
        <FinancialSummaryCard
          title="Total Budget Remaining"
          value={`$${summaryData.totalBudgetRemaining.toFixed(2)}`}
          icon={Wallet}
          description="Available budget"
          trend={{ value: 8.3, isPositive: true }}
        />
        <FinancialSummaryCard
          title="Total Income (This Month)"
          value={`$${summaryData.totalIncome.toFixed(2)}`}
          icon={ArrowUpRight}
          description="Monthly income"
          trend={{ value: 3.1, isPositive: true }}
        />
      </div>

      {/* Section 2: Expenses Summary + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-[#003366] mb-2">Recent Expenses</h2>
            <p className="text-[#00509e] text-sm">Latest 5 expense transactions</p>
          </div>
          <div className="p-6">
            {recentTransactions.filter(t => t.type === 'expense').length > 0 ? (
              <DataTable
                title=""
                columns={expenseColumns}
                data={recentTransactions.filter(t => t.type === 'expense')}
                maxRows={5}
                onViewAll={() => console.log('View all expenses')}
              />
            ) : (
              <EmptyTransactions />
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-[#003366] mb-2">Expenses by Category</h2>
            <p className="text-[#00509e] text-sm">Spending distribution this month</p>
          </div>
          <div className="p-6">
            {expenseCategories.length > 0 ? (
              <DynamicPieChart title="" data={expenseCategories} />
            ) : (
              <EmptyExpenseCategories />
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Credit Card List */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Credit Cards</h2>
          <p className="text-[#00509e]">Manage your credit card accounts</p>
        </div>
        {creditCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((card) => (
              <CreditCardItem
                key={card.id}
                cardName={card.card_name}
                cardType={card.card_type}
                lastFourDigits={card.last_four_digits}
                creditLimit={card.credit_limit}
                currentBalance={card.current_balance}
                availableCredit={card.available_credit}
                usagePercentage={card.usage_percentage}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <EmptyCreditCards />
          </div>
        )}
      </div>

      {/* Section 4: Installments + Monthly Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-[#003366] mb-2">Installments</h2>
            <p className="text-[#00509e] text-sm">Active installment plans</p>
          </div>
          <div className="p-6">
            {installments.length > 0 ? (
              <DataTable
                title=""
                columns={installmentColumns}
                data={installments}
                maxRows={5}
                onViewAll={() => console.log('View all installments')}
              />
            ) : (
              <EmptyInstallments />
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-[#003366] mb-2">Monthly Payments</h2>
            <p className="text-[#00509e] text-sm">Recurring monthly obligations</p>
          </div>
          <div className="p-6">
            {recurringPayments.length > 0 ? (
              <DataTable
                title=""
                columns={paymentColumns}
                data={recurringPayments}
                maxRows={5}
                onViewAll={() => console.log('View all payments')}
              />
            ) : (
              <EmptyRecurringPayments />
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Monthly Trends (Line Graph) */}
      <div className="mb-8">
        <DynamicLineChart
          title="Monthly Financial Trends"
          description="Track your financial progress over time"
          data={monthlyTrends}
        />
      </div>
    </div>
  );
}
