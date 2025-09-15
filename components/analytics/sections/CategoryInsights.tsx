"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { DynamicPieChart } from "@/components/dashboard/ui/DynamicPieChart";
import { DynamicLineChart } from "@/components/dashboard/ui/DynamicLineChart";
import { Button } from "@/components/ui/button";
import { PieChart, TrendingUp, ShoppingBag, Eye } from "lucide-react";
import type { CategorySpendingData, HighValueTransactionData } from "@/lib/services/analytics-server";

interface CategoryInsightsProps {
  categorySpending: CategorySpendingData[];
  highValueTransactions: HighValueTransactionData[];
}

export function CategoryInsights({ 
  categorySpending, 
  highValueTransactions 
}: CategoryInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'drilldown'>('overview');

  // Prepare data for pie chart
  const categoryChartData = categorySpending.map(category => ({
    name: category.category_name,
    value: category.total_amount,
    color: category.category_color
  }));

  // Get selected category data
  const selectedCategoryData = selectedCategory 
    ? categorySpending.find(cat => cat.category_name === selectedCategory)
    : null;

  // High-value transactions for selected category
  const categoryHighValueTransactions = selectedCategory
    ? highValueTransactions.filter(transaction => transaction.category_name === selectedCategory)
    : [];

  // Prepare category comparison data (this month vs last month - simulated)
  const categoryComparisonData = categorySpending.map(category => ({
    category: category.category_name,
    thisMonth: category.total_amount,
    lastMonth: category.total_amount * (0.8 + Math.random() * 0.4), // Simulated data
    change: ((category.total_amount - (category.total_amount * (0.8 + Math.random() * 0.4))) / (category.total_amount * (0.8 + Math.random() * 0.4))) * 100
  }));

  // Top vendors/merchants (simulated based on high-value transactions)
  const topVendors = categoryHighValueTransactions.map(transaction => ({
    vendor: transaction.description.split(' ').slice(0, 2).join(' '), // Extract vendor from description
    amount: transaction.amount,
    date: new Date(transaction.date).toLocaleDateString(),
    type: transaction.type
  }));

  const vendorColumns = [
    { key: "vendor", label: "Vendor/Merchant" },
    { key: "amount", label: "Amount", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "date", label: "Date" },
    { key: "type", label: "Type", render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'income' ? 'bg-green-100 text-green-800' :
        value === 'expense' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )}
  ];

  const comparisonColumns = [
    { key: "category", label: "Category" },
    { key: "thisMonth", label: "This Month", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "lastMonth", label: "Last Month", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "change", label: "Change %", render: (value: number) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}%
      </span>
    )}
  ];

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setViewMode('drilldown');
  };

  const handleBackToOverview = () => {
    setSelectedCategory(null);
    setViewMode('overview');
  };

  if (viewMode === 'drilldown' && selectedCategoryData) {
    return (
      <div className="space-y-6">
        {/* Drilldown Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToOverview}
              className="text-[#00509e] border-[#00509e] hover:bg-[#cce0ff]"
            >
              ← Back to Overview
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-[#003366] mb-2">
                {selectedCategoryData.category_name} Insights
              </h2>
              <p className="text-[#00509e]">Deep dive into category spending patterns</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Total Spent</div>
            <div className="text-lg font-semibold text-[#003366]">
              ${selectedCategoryData.total_amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Summary */}
          <Card className="bg-white shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedCategoryData.category_color }}
                />
                Category Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#00509e]">Total Amount:</span>
                  <span className="font-semibold text-[#003366]">
                    ${selectedCategoryData.total_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00509e]">Transactions:</span>
                  <span className="font-semibold text-[#003366]">
                    {selectedCategoryData.transaction_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00509e]">Average Transaction:</span>
                  <span className="font-semibold text-[#003366]">
                    ${selectedCategoryData.avg_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00509e]">% of Total Spending:</span>
                  <span className="font-semibold text-[#003366]">
                    {selectedCategoryData.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Vendors */}
          <Card className="bg-white shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                Top Vendors/Merchants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topVendors.length > 0 ? (
                <DataTable
                  title=""
                  columns={vendorColumns}
                  data={topVendors}
                  maxRows={5}
                  onViewAll={() => console.log('View all vendors')}
                />
              ) : (
                <div className="flex items-center justify-center h-32 text-[#00509e]">
                  No vendor data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Category Insights</h2>
          <p className="text-[#00509e]">Deep dive into spending categories and patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overview')}
            className={viewMode === 'overview' ? 'bg-[#007acc] text-white' : 'text-[#00509e] border-[#00509e] hover:bg-[#cce0ff]'}
          >
            <Eye className="w-4 h-4 mr-2" />
            Overview
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Pie Chart */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Spending by Category
            </CardTitle>
            <p className="text-sm text-[#00509e]">Click on a category to drill down</p>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <div onClick={() => handleCategoryClick('Food & Dining')}>
                <DynamicPieChart 
                  title=""
                  data={categoryChartData}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-[#00509e]">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Comparison Chart */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              This Month vs Last Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryComparisonData.length > 0 ? (
              <div className="space-y-4">
                {categoryComparisonData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#003366]">{item.category}</span>
                      <span className="text-sm text-[#00509e]">
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>This Month</span>
                        <span className="font-medium">${item.thisMonth.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Month</span>
                        <span className="font-medium">${item.lastMonth.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#007acc] h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (item.thisMonth / Math.max(item.thisMonth, item.lastMonth)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-[#00509e]">
                No comparison data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Comparison Table */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Category Spending Comparison
          </CardTitle>
          <p className="text-sm text-[#00509e]">Month-over-month spending changes</p>
        </CardHeader>
        <CardContent>
          {categoryComparisonData.length > 0 ? (
            <DataTable
              title=""
              columns={comparisonColumns}
              data={categoryComparisonData}
              maxRows={10}
              onViewAll={() => console.log('View all category comparisons')}
            />
          ) : (
            <div className="flex items-center justify-center h-32 text-[#00509e]">
              No comparison data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Category Actions */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#003366]">Quick Category Actions</CardTitle>
          <p className="text-sm text-[#00509e]">Click on any category to explore detailed insights</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categorySpending.slice(0, 8).map((category, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center gap-2 p-3 h-auto text-left justify-start"
                onClick={() => handleCategoryClick(category.category_name)}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.category_color }}
                />
                <div>
                  <div className="font-medium text-[#003366] text-sm">{category.category_name}</div>
                  <div className="text-xs text-[#00509e]">${category.total_amount.toFixed(0)}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
