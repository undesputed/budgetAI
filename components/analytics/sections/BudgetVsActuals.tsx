"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import type { BudgetVsActualData } from "@/lib/services/analytics-server";

interface BudgetVsActualsProps {
  budgetVsActual: BudgetVsActualData[];
}

export function BudgetVsActuals({ budgetVsActual }: BudgetVsActualsProps) {
  // Prepare data for progress bars
  const budgetProgressData = budgetVsActual.map(budget => ({
    category: budget.category_name,
    allocated: budget.allocated_amount,
    spent: budget.actual_spent,
    percentage: budget.usage_percentage,
    color: budget.category_color,
    status: budget.usage_percentage > 100 ? 'over' : budget.usage_percentage > 80 ? 'warning' : 'good'
  }));

  // Budget vs Actual table
  const budgetTableData = budgetVsActual.map(budget => ({
    budget: budget.budget_name,
    category: budget.category_name,
    allocated: budget.allocated_amount,
    spent: budget.actual_spent,
    remaining: budget.allocated_amount - budget.actual_spent,
    percentage: budget.usage_percentage,
    status: budget.usage_percentage > 100 ? 'Over Budget' : 
            budget.usage_percentage > 80 ? 'Near Limit' : 'On Track'
  }));

  const budgetColumns = [
    { key: "budget", label: "Budget" },
    { key: "category", label: "Category" },
    { key: "allocated", label: "Allocated", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "spent", label: "Spent", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "remaining", label: "Remaining", render: (value: number) => (
      <span className={value < 0 ? 'text-red-600' : 'text-green-600'}>
        ${value.toFixed(2)}
      </span>
    )},
    { key: "percentage", label: "Usage %", render: (value: number) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value > 100 ? 'bg-red-100 text-red-800' :
        value > 80 ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {value.toFixed(1)}%
      </span>
    )},
    { key: "status", label: "Status", render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'Over Budget' ? 'bg-red-100 text-red-800' :
        value === 'Near Limit' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {value}
      </span>
    )}
  ];

  // Calculate totals
  const totalAllocated = budgetVsActual.reduce((sum, budget) => sum + budget.allocated_amount, 0);
  const totalSpent = budgetVsActual.reduce((sum, budget) => sum + budget.actual_spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUsagePercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Count categories by status
  const overBudgetCount = budgetVsActual.filter(budget => budget.usage_percentage > 100).length;
  const nearLimitCount = budgetVsActual.filter(budget => budget.usage_percentage > 80 && budget.usage_percentage <= 100).length;
  const onTrackCount = budgetVsActual.filter(budget => budget.usage_percentage <= 80).length;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Budget vs Actuals</h2>
          <p className="text-[#00509e]">Performance against budget goals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Allocated</div>
            <div className="text-lg font-semibold text-[#003366]">${totalAllocated.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Spent</div>
            <div className="text-lg font-semibold text-blue-600">${totalSpent.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Remaining</div>
            <div className={`text-lg font-semibold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${totalRemaining.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Overall Budget Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#003366]">Budget Utilization</span>
              <span className="text-sm font-semibold text-[#003366]">{overallUsagePercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(overallUsagePercentage, 100)} 
              className="h-3"
            />
            <div className="flex items-center justify-between text-sm text-[#00509e]">
              <span>${totalSpent.toFixed(2)} spent</span>
              <span>${totalAllocated.toFixed(2)} allocated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Over Budget Alert */}
      {overBudgetCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-semibold text-red-800">Over Budget Alert</div>
                <div className="text-sm text-red-600">
                  {overBudgetCount} categor{overBudgetCount > 1 ? 'ies are' : 'y is'} over budget
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Progress Bars */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Category Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetProgressData.map((budget, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: budget.color }}
                    />
                    <span className="text-sm font-medium text-[#003366]">{budget.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#00509e]">
                      ${budget.spent.toFixed(2)} / ${budget.allocated.toFixed(2)}
                    </span>
                    <span className={`text-sm font-semibold ${
                      budget.status === 'over' ? 'text-red-600' :
                      budget.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min(budget.percentage, 100)} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget vs Actual Table */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Budget vs Actual Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetTableData.length > 0 ? (
            <DataTable
              title=""
              columns={budgetColumns}
              data={budgetTableData}
              maxRows={10}
              onViewAll={() => console.log('View all budget details')}
            />
          ) : (
            <div className="flex items-center justify-center h-32 text-[#00509e]">
              No budget data found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">On Track</div>
                <div className="text-lg font-bold text-green-800">{onTrackCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-yellow-600 font-medium">Near Limit</div>
                <div className="text-lg font-bold text-yellow-800">{nearLimitCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-red-600 font-medium">Over Budget</div>
                <div className="text-lg font-bold text-red-800">{overBudgetCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Overall Usage</div>
                <div className="text-lg font-bold text-blue-800">{overallUsagePercentage.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
