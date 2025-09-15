"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Download } from "lucide-react";
import { exportAllAnalyticsData } from "@/lib/utils/csv-export";
import type { AnalyticsFilters as AnalyticsFiltersType } from "@/lib/services/analytics-server";
import type { AnalyticsData } from "@/lib/services/analytics-server";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onFiltersChange: (filters: AnalyticsFiltersType) => void;
  analyticsData: AnalyticsData;
}

export function AnalyticsFilters({ filters, onFiltersChange, analyticsData }: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof AnalyticsFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleExportCSV = () => {
    try {
      exportAllAnalyticsData(analyticsData, filters);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-[#003366] flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Analytics Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-[#00509e] border-[#00509e] hover:bg-[#cce0ff]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#00509e] border-[#00509e] hover:bg-[#cce0ff]"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#003366]">Time Period</label>
              <Select
                value={filters.period}
                onValueChange={(value) => handleFilterChange('period', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#003366]">Account</label>
              <Select
                value={filters.account}
                onValueChange={(value) => handleFilterChange('account', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="credit_cards">Credit Cards Only</SelectItem>
                  <SelectItem value="bank_accounts">Bank Accounts Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#003366]">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range (shown when custom is selected) */}
            {filters.period === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#003366]">Custom Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#007acc] focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-[#00509e] font-medium">Active Filters:</span>
              {filters.period !== 'month' && (
                <span className="px-2 py-1 bg-[#cce0ff] text-[#003366] rounded-full text-xs">
                  Period: {filters.period}
                </span>
              )}
              {filters.account !== 'all' && (
                <span className="px-2 py-1 bg-[#cce0ff] text-[#003366] rounded-full text-xs">
                  Account: {filters.account}
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="px-2 py-1 bg-[#cce0ff] text-[#003366] rounded-full text-xs">
                  Category: {filters.category}
                </span>
              )}
              {filters.startDate && (
                <span className="px-2 py-1 bg-[#cce0ff] text-[#003366] rounded-full text-xs">
                  From: {filters.startDate}
                </span>
              )}
              {filters.endDate && (
                <span className="px-2 py-1 bg-[#cce0ff] text-[#003366] rounded-full text-xs">
                  To: {filters.endDate}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
