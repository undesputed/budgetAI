"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicLineChart } from "@/components/dashboard/ui/DynamicLineChart";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { Activity, BarChart3, TrendingUp, Calendar } from "lucide-react";
import type { MonthlyTransactionData, HighValueTransactionData } from "@/lib/services/analytics-server";

interface TransactionTrendsProps {
  monthlyTransactions: MonthlyTransactionData[];
  highValueTransactions: HighValueTransactionData[];
}

export function TransactionTrends({ 
  monthlyTransactions, 
  highValueTransactions 
}: TransactionTrendsProps) {
  const [viewMode, setViewMode] = useState<'count' | 'amount'>('amount');

  // Prepare data for charts
  const transactionTrendData = monthlyTransactions.map(month => ({
    month: month.month,
    count: month.transaction_count,
    amount: month.income + month.expenses + month.transfers,
    expenses: month.expenses,
    transactions: month.transaction_count,
    transfers: month.transfers,
    budget: 3000 // Default budget
  }));

  // High-value transactions table
  const highValueTableData = highValueTransactions.map(transaction => ({
    date: new Date(transaction.date).toLocaleDateString(),
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category_name,
    account: transaction.credit_card_name || transaction.bank_account_name || 'Cash'
  }));

  const highValueColumns = [
    { key: "date", label: "Date" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "type", label: "Type", render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'income' ? 'bg-green-100 text-green-800' :
        value === 'expense' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )},
    { key: "category", label: "Category" },
    { key: "account", label: "Account" }
  ];

  // Calculate totals
  const totalTransactions = monthlyTransactions.reduce((sum, month) => sum + month.transaction_count, 0);
  const totalAmount = monthlyTransactions.reduce((sum, month) => sum + month.income + month.expenses + month.transfers, 0);
  const avgTransactionValue = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Transaction Trends</h2>
          <p className="text-[#00509e]">Financial activity patterns over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Transactions</div>
            <div className="text-lg font-semibold text-[#003366]">{totalTransactions}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Amount</div>
            <div className="text-lg font-semibold text-[#003366]">${totalAmount.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Avg Transaction</div>
            <div className="text-lg font-semibold text-[#003366]">${avgTransactionValue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#003366]">View:</span>
        <Button
          variant={viewMode === 'count' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('count')}
          className={viewMode === 'count' ? 'bg-[#007acc] text-white' : 'text-[#00509e] border-[#00509e] hover:bg-[#cce0ff]'}
        >
          <Activity className="w-4 h-4 mr-2" />
          Transaction Count
        </Button>
        <Button
          variant={viewMode === 'amount' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('amount')}
          className={viewMode === 'amount' ? 'bg-[#007acc] text-white' : 'text-[#00509e] border-[#00509e] hover:bg-[#cce0ff]'}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Transaction Amounts
        </Button>
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Trends Line Chart */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              {viewMode === 'count' ? 'Transaction Count Trend' : 'Transaction Amount Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionTrendData.length > 0 ? (
              <DynamicLineChart
                title=""
                data={transactionTrendData}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-[#00509e]">
                No transaction data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* High-Value Transactions Table */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              High-Value Transactions
            </CardTitle>
            <p className="text-sm text-[#00509e]">Transactions over $100</p>
          </CardHeader>
          <CardContent>
            {highValueTableData.length > 0 ? (
              <DataTable
                title=""
                columns={highValueColumns}
                data={highValueTableData}
                maxRows={10}
                onViewAll={() => console.log('View all high-value transactions')}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-[#00509e]">
                No high-value transactions found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Most Active Month</div>
                <div className="text-lg font-bold text-blue-800">
                  {monthlyTransactions.length > 0 
                    ? new Date(monthlyTransactions.reduce((max, month) => 
                        month.transaction_count > max.transaction_count ? month : max
                      ).month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">Highest Amount Month</div>
                <div className="text-lg font-bold text-green-800">
                  {monthlyTransactions.length > 0 
                    ? new Date(monthlyTransactions.reduce((max, month) => 
                        (month.income + month.expenses + month.transfers) > 
                        (max.income + max.expenses + max.transfers) ? month : max
                      ).month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-purple-600 font-medium">Avg Monthly Activity</div>
                <div className="text-lg font-bold text-purple-800">
                  {monthlyTransactions.length > 0 
                    ? Math.round(monthlyTransactions.reduce((sum, month) => sum + month.transaction_count, 0) / monthlyTransactions.length)
                    : 0
                  } transactions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
