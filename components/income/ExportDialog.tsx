'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  CheckCircle
} from 'lucide-react';
import { IncomeTransaction, IncomeFilters } from '@/lib/services/expense-service-client';
import { convertToCSV, downloadCSV } from '@/lib/utils/csv-export';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: IncomeTransaction[];
  dataType: 'income';
  filters: IncomeFilters;
}

interface ExportOptions {
  dateRange: 'all' | 'current_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeColumns: {
    date: boolean;
    description: boolean;
    amount: boolean;
    category: boolean;
    paymentMethod: boolean;
    type: boolean;
    status: boolean;
    source: boolean;
    notes: boolean;
  };
  format: 'csv' | 'excel';
}

export function ExportDialog({ 
  open, 
  onOpenChange, 
  data, 
  dataType,
  filters 
}: ExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dateRange: 'all',
    includeColumns: {
      date: true,
      description: true,
      amount: true,
      category: true,
      paymentMethod: true,
      type: true,
      status: true,
      source: true,
      notes: true,
    },
    format: 'csv',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportComplete(false);

      // Filter data based on export options
      let filteredData = [...data];

      // Apply date range filter
      if (exportOptions.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (exportOptions.dateRange) {
          case 'current_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'last_month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
          case 'last_3_months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            break;
          case 'last_6_months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            break;
          case 'last_year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            break;
          case 'custom':
            if (exportOptions.customStartDate && exportOptions.customEndDate) {
              startDate = new Date(exportOptions.customStartDate);
              endDate = new Date(exportOptions.customEndDate);
            } else {
              startDate = new Date(0);
            }
            break;
          default:
            startDate = new Date(0);
        }

        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      // Prepare CSV data with selected columns
      const csvData = filteredData.map(item => {
        const row: any = {};
        
        if (exportOptions.includeColumns.date) {
          row.Date = item.date;
        }
        if (exportOptions.includeColumns.description) {
          row.Description = item.description;
        }
        if (exportOptions.includeColumns.amount) {
          row.Amount = item.amount;
        }
        if (exportOptions.includeColumns.category) {
          row.Category = item.category_name || 'Uncategorized';
        }
        if (exportOptions.includeColumns.paymentMethod) {
          row['Payment Method'] = item.payment_method_name || 'Not specified';
        }
        if (exportOptions.includeColumns.type) {
          row.Type = item.income_type_label || item.income_type;
        }
        if (exportOptions.includeColumns.status) {
          row.Status = item.status;
        }
        if (exportOptions.includeColumns.source) {
          row.Source = item.income_source || 'Not specified';
        }
        if (exportOptions.includeColumns.notes) {
          row.Notes = item.notes || '';
        }

        return row;
      });

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `income-export-${timestamp}.csv`;

      // Export to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = convertToCSV(csvData, headers);
      downloadCSV(csvContent, filename);

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    
    if (filters.type && filters.type !== 'all') {
      activeFilters.push(`Type: ${filters.type}`);
    }
    if (filters.status && filters.status !== 'all') {
      activeFilters.push(`Status: ${filters.status}`);
    }
    if (filters.date_from) {
      activeFilters.push(`From: ${filters.date_from}`);
    }
    if (filters.date_to) {
      activeFilters.push(`To: ${filters.date_to}`);
    }
    if (filters.income_source) {
      activeFilters.push(`Source: ${filters.income_source}`);
    }

    return activeFilters;
  };

  const activeFilters = getFilterSummary();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Income Data
          </DialogTitle>
          <DialogDescription>
            Export your income transactions to CSV format with custom filters and column selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Export Summary</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total records: {data.length}</p>
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  <span>Active filters: {activeFilters.length}</span>
                </div>
              )}
            </div>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <Select
              value={exportOptions.dateRange}
              onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {exportOptions.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={exportOptions.customStartDate || ''}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      customStartDate: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={exportOptions.customEndDate || ''}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      customEndDate: e.target.value 
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Column Selection */}
          <div className="space-y-3">
            <Label>Include Columns</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(exportOptions.includeColumns).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({
                        ...prev,
                        includeColumns: {
                          ...prev.includeColumns,
                          [key]: checked as boolean
                        }
                      }))
                    }
                  />
                  <Label htmlFor={key} className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: 'csv' | 'excel') => 
                setExportOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="excel" disabled>Excel (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || exportComplete}
              className="flex items-center gap-2"
            >
              {exportComplete ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Exported!
                </>
              ) : isExporting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
