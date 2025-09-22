'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IncomeFilters as IncomeFiltersType } from '@/lib/services/expense-service-client';

interface IncomeFiltersProps {
  filters: IncomeFiltersType;
  onFiltersChange: (filters: IncomeFiltersType) => void;
}

export function IncomeFilters({ filters, onFiltersChange }: IncomeFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleFilterChange = (key: keyof IncomeFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setOpen(false);
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof IncomeFiltersType];
    return value !== undefined && value !== '' && value !== 'all';
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 bg-blue-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter Income</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {/* Income Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type-filter">Income Type</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General Income</SelectItem>
                  <SelectItem value="recurring">Recurring Income</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                />
              </div>
            </div>

            {/* Amount Range Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="amount-min">Min Amount</Label>
                <Input
                  id="amount-min"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.amount_min || ''}
                  onChange={(e) => handleFilterChange('amount_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount-max">Max Amount</Label>
                <Input
                  id="amount-max"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.amount_max || ''}
                  onChange={(e) => handleFilterChange('amount_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Income Source Filter */}
            <div className="space-y-2">
              <Label htmlFor="source-filter">Income Source</Label>
              <Input
                id="source-filter"
                placeholder="Filter by source..."
                value={filters.income_source || ''}
                onChange={(e) => handleFilterChange('income_source', e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setOpen(false)} size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
