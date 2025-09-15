"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { CreditCard, Building2, TrendingUp, AlertTriangle } from "lucide-react";
import type { CreditCardUsageData, BankAccountData } from "@/lib/services/analytics-server";

interface CreditCardBankUsageProps {
  creditCardUsage: CreditCardUsageData[];
  bankAccounts: BankAccountData[];
}

export function CreditCardBankUsage({ 
  creditCardUsage, 
  bankAccounts 
}: CreditCardBankUsageProps) {
  // Prepare credit card data for stacked bar chart
  const creditCardChartData = creditCardUsage.map(card => ({
    name: card.card_name,
    used: card.current_balance,
    available: card.available_credit,
    limit: card.credit_limit
  }));

  // Prepare bank account data for bar chart
  const bankAccountChartData = bankAccounts.map(account => ({
    name: account.account_name,
    balance: account.current_balance,
    available: account.available_balance
  }));

  // Top 5 credit cards table
  const topCreditCards = creditCardUsage.slice(0, 5).map(card => ({
    card: `${card.card_name} (****${card.last_four_digits})`,
    type: card.card_type.toUpperCase(),
    limit: card.credit_limit,
    used: card.current_balance,
    available: card.available_credit,
    usage: card.usage_percentage,
    monthly: card.monthly_expenses
  }));

  const creditCardColumns = [
    { key: "card", label: "Card" },
    { key: "type", label: "Type" },
    { key: "limit", label: "Limit", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "used", label: "Used", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "available", label: "Available", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "usage", label: "Usage %", render: (value: number) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value > 80 ? 'bg-red-100 text-red-800' :
        value > 60 ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {value.toFixed(1)}%
      </span>
    )},
    { key: "monthly", label: "Monthly", render: (value: number) => `$${value.toFixed(2)}` }
  ];

  // Bank accounts table
  const bankAccountsTable = bankAccounts.map(account => ({
    account: account.account_name,
    type: account.account_type,
    balance: account.current_balance,
    available: account.available_balance,
    income: account.monthly_income,
    expenses: account.monthly_expenses
  }));

  const bankAccountColumns = [
    { key: "account", label: "Account" },
    { key: "type", label: "Type" },
    { key: "balance", label: "Balance", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "available", label: "Available", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "income", label: "Monthly Income", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "expenses", label: "Monthly Expenses", render: (value: number) => `$${value.toFixed(2)}` }
  ];

  // Calculate totals
  const totalCreditLimit = creditCardUsage.reduce((sum, card) => sum + card.credit_limit, 0);
  const totalCreditUsed = creditCardUsage.reduce((sum, card) => sum + card.current_balance, 0);
  const totalCreditAvailable = creditCardUsage.reduce((sum, card) => sum + card.available_credit, 0);
  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.current_balance, 0);
  const totalBankAvailable = bankAccounts.reduce((sum, account) => sum + account.available_balance, 0);

  // Find high usage cards
  const highUsageCards = creditCardUsage.filter(card => card.usage_percentage > 80);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Credit Card & Bank Usage</h2>
          <p className="text-[#00509e]">Debt and liquidity analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Credit Limit</div>
            <div className="text-lg font-semibold text-[#003366]">${totalCreditLimit.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Credit Used</div>
            <div className="text-lg font-semibold text-red-600">${totalCreditUsed.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Bank Balance</div>
            <div className="text-lg font-semibold text-green-600">${totalBankBalance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* High Usage Alert */}
      {highUsageCards.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-semibold text-red-800">High Credit Card Usage Alert</div>
                <div className="text-sm text-red-600">
                  {highUsageCards.length} credit card{highUsageCards.length > 1 ? 's' : ''} with usage over 80%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Card Usage Table */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Credit Card Usage
            </CardTitle>
            <p className="text-sm text-[#00509e]">Top 5 credit cards by usage</p>
          </CardHeader>
          <CardContent>
            {topCreditCards.length > 0 ? (
              <DataTable
                title=""
                columns={creditCardColumns}
                data={topCreditCards}
                maxRows={5}
                onViewAll={() => console.log('View all credit cards')}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-[#00509e]">
                No credit cards found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Accounts Table */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-500" />
              Bank Account Balances
            </CardTitle>
            <p className="text-sm text-[#00509e]">Current balances and monthly activity</p>
          </CardHeader>
          <CardContent>
            {bankAccountsTable.length > 0 ? (
              <DataTable
                title=""
                columns={bankAccountColumns}
                data={bankAccountsTable}
                maxRows={5}
                onViewAll={() => console.log('View all bank accounts')}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-[#00509e]">
                No bank accounts found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Credit Utilization</div>
                <div className="text-lg font-bold text-blue-800">
                  {totalCreditLimit > 0 ? ((totalCreditUsed / totalCreditLimit) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">Available Credit</div>
                <div className="text-lg font-bold text-green-800">${totalCreditAvailable.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-purple-600 font-medium">Total Bank Balance</div>
                <div className="text-lg font-bold text-purple-800">${totalBankBalance.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-orange-600 font-medium">High Usage Cards</div>
                <div className="text-lg font-bold text-orange-800">{highUsageCards.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
