"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  CheckCircle
} from "lucide-react";
import { ExpenseTransaction } from "@/lib/services/expense-service-client";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenses: ExpenseTransaction[];
  filteredExpenses: ExpenseTransaction[];
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
    notes: boolean;
    receiptUrl: boolean;
    installmentInfo: boolean;
    createdAt: boolean;
  };
  format: 'csv' | 'excel';
  filename: string;
}

export function ExportDialog({ 
  open, 
  onOpenChange, 
  expenses, 
  filteredExpenses 
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
      notes: false,
      receiptUrl: false,
      installmentInfo: true,
      createdAt: false
    },
    format: 'csv',
    filename: `expenses_${new Date().toISOString().split('T')[0]}`
  });

  const [isExporting, setIsExporting] = useState(false);

  const getFilteredData = () => {
    let data = filteredExpenses;
    
    // Apply date range filter
    if (exportOptions.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (exportOptions.dateRange) {
        case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
            const endDate = new Date(exportOptions.customEndDate);
            data = data.filter(expense => {
              const expenseDate = new Date(expense.date);
              return expenseDate >= startDate && expenseDate <= endDate;
            });
            return data;
          }
          break;
      }
      
      if (exportOptions.dateRange !== 'custom') {
        data = data.filter(expense => new Date(expense.date) >= startDate);
      }
    }
    
    return data;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const dataToExport = getFilteredData();
      
      if (dataToExport.length === 0) {
        alert('No expenses found for the selected criteria.');
        return;
      }

      // Import CSV utilities dynamically
      const { convertToCSV, downloadCSV, formatDateForCSV } = await import('@/lib/utils/csv-export');
      
      // Prepare data based on selected columns
      const exportData = dataToExport.map(expense => {
        const row: any = {};
        
        if (exportOptions.includeColumns.date) {
          row['Date'] = formatDateForCSV(expense.date);
        }
        if (exportOptions.includeColumns.description) {
          row['Description'] = expense.description || '';
        }
        if (exportOptions.includeColumns.amount) {
          row['Amount'] = expense.amount;
        }
        if (exportOptions.includeColumns.category) {
          row['Category'] = expense.category_name || '';
        }
        if (exportOptions.includeColumns.paymentMethod) {
          row['Payment Method'] = expense.payment_method_name || '';
        }
        if (exportOptions.includeColumns.type) {
          row['Type'] = expense.expense_type || '';
        }
        if (exportOptions.includeColumns.status) {
          row['Status'] = expense.status || '';
        }
        if (exportOptions.includeColumns.notes) {
          row['Notes'] = expense.notes || '';
        }
        if (exportOptions.includeColumns.receiptUrl) {
          row['Receipt URL'] = expense.receipt_url || '';
        }
        if (exportOptions.includeColumns.installmentInfo) {
          row['Installment Info'] = expense.installment_number && expense.installment_total 
            ? `${expense.installment_number}/${expense.installment_total}` 
            : '';
        }
        if (exportOptions.includeColumns.createdAt) {
          row['Created At'] = formatDateForCSV(expense.created_at);
        }
        
        return row;
      });

      // Get headers from the first row
      const headers = Object.keys(exportData[0] || {});
      
      // Generate CSV content
      const csvContent = convertToCSV(exportData, headers);
      
      // Generate filename
      const extension = exportOptions.format === 'csv' ? 'csv' : 'xlsx';
      const filename = `${exportOptions.filename}.${extension}`;
      
      // Download the file
      downloadCSV(csvContent, filename);
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error exporting expenses:', error);
      alert('Failed to export expenses. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getDataSummary = () => {
    const data = getFilteredData();
    const totalAmount = data.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      count: data.length,
      totalAmount,
      dateRange: exportOptions.dateRange
    };
  };

  const summary = getDataSummary();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Expenses
          </DialogTitle>
          <DialogDescription>
            Choose your export options and download your expense data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Export Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Records:</span>
                <p className="font-semibold text-blue-900">{summary.count}</p>
              </div>
              <div>
                <span className="text-blue-700">Total Amount:</span>
                <p className="font-semibold text-blue-900">${summary.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-blue-700">Date Range:</span>
                <p className="font-semibold text-blue-900 capitalize">
                  {summary.dateRange.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-4">
            <h3 className="font-medium text-[#003366]">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-range">Select Range</Label>
                <Select
                  value={exportOptions.dateRange}
                  onValueChange={(value: any) => setExportOptions(prev => ({ 
                    ...prev, 
                    dateRange: value 
                  }))}
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
              </div>
              
              {exportOptions.dateRange === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={exportOptions.customStartDate || ''}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        customStartDate: e.target.value 
                      }))}
                      placeholder="Start Date"
                    />
                    <Input
                      type="date"
                      value={exportOptions.customEndDate || ''}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        customEndDate: e.target.value 
                      }))}
                      placeholder="End Date"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column Selection */}
          <div className="space-y-4">
            <h3 className="font-medium text-[#003366]">Include Columns</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(exportOptions.includeColumns).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setExportOptions(prev => ({
                      ...prev,
                      includeColumns: {
                        ...prev.includeColumns,
                        [key]: checked as boolean
                      }
                    }))}
                  />
                  <Label htmlFor={key} className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Format and Filename */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(value: any) => setExportOptions(prev => ({ 
                  ...prev, 
                  format: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={exportOptions.filename}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  filename: e.target.value 
                }))}
                placeholder="expenses_2024-01-15"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || summary.count === 0}
              className="bg-[#007acc] hover:bg-[#00509e] text-white"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {summary.count} Records
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


