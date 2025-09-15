"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicPieChart } from "@/components/dashboard/ui/DynamicPieChart";
import { DynamicLineChart } from "@/components/dashboard/ui/DynamicLineChart";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { CategorySpendingData, MonthlyTransactionData } from "@/lib/services/analytics-server";

interface ExpenseIncomeBreakdownProps {
  categorySpending: CategorySpendingData[];
  monthlyTransactions: MonthlyTransactionData[];
}

export function ExpenseIncomeBreakdown({ 
  categorySpending, 
  monthlyTransactions 
}: ExpenseIncomeBreakdownProps) {
  // Prepare data for charts
  const expenseCategories = categorySpending.slice(0, 8).map(cat => ({
    name: cat.category_name,
    value: cat.total_amount,
    color: cat.category_color
  }));

  const incomeVsExpenseData = monthlyTransactions.map(month => ({
    month: month.month,
    income: month.income,
    expenses: month.expenses,
    net: month.income - month.expenses,
    transactions: month.transaction_count,
    transfers: 0, // Not available in current data
    budget: 3000 // Default budget
  }));

  // Top 5 expense categories table
  const topExpenseCategories = categorySpending.slice(0, 5).map(cat => ({
    category: cat.category_name,
    amount: cat.total_amount,
    percentage: cat.percentage,
    transactions: cat.transaction_count
  }));

  // Top 5 income sources (simulated for now)
  const topIncomeSources = [
    { source: "Salary", amount: 5000, percentage: 80, transactions: 1 },
    { source: "Freelance", amount: 800, percentage: 13, transactions: 3 },
    { source: "Investments", amount: 400, percentage: 6, transactions: 2 },
    { source: "Bonus", amount: 200, percentage: 1, transactions: 1 }
  ];

  const expenseColumns = [
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "percentage", label: "% of Total", render: (value: number) => `${value.toFixed(1)}%` },
    { key: "transactions", label: "Transactions" }
  ];

  const incomeColumns = [
    { key: "source", label: "Source" },
    { key: "amount", label: "Amount", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "percentage", label: "% of Total", render: (value: number) => `${value.toFixed(1)}%` },
    { key: "transactions", label: "Transactions" }
  ];

  // Calculate totals
  const totalExpenses = categorySpending.reduce((sum, cat) => sum + cat.total_amount, 0);
  const totalIncome = monthlyTransactions.reduce((sum, month) => sum + month.income, 0);
  const netIncome = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Expense & Income Breakdown</h2>
          <p className="text-[#00509e]">Where your money comes from and where it goes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Income</div>
            <div className="text-lg font-semibold text-green-600">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Expenses</div>
            <div className="text-lg font-semibold text-red-600">${totalExpenses.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Net Income</div>
            <div className={`text-lg font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Pie Chart */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length > 0 ? (
              <DynamicPieChart 
                title=""
                data={expenseCategories}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-[#00509e]">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expenses Line Chart */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Income vs Expenses Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeVsExpenseData.length > 0 ? (
              <DynamicLineChart
                title=""
                data={incomeVsExpenseData}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-[#00509e]">
                No transaction data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Expense Categories */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              Top 5 Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenseCategories.length > 0 ? (
              <DataTable
                title=""
                columns={expenseColumns}
                data={topExpenseCategories}
                maxRows={5}
                onViewAll={() => console.log('View all expense categories')}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-[#00509e]">
                No expense categories found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Income Sources */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top 5 Income Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title=""
              columns={incomeColumns}
              data={topIncomeSources}
              maxRows={5}
              onViewAll={() => console.log('View all income sources')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
