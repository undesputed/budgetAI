// CSV Export utility functions for analytics data

export interface ExportableData {
  [key: string]: any;
}

export function convertToCSV(data: ExportableData[], headers: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Create CSV header row
  const csvHeaders = headers.join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that contain commas, quotes, or newlines
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function formatDateForCSV(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatCurrencyForCSV(amount: number): string {
  return amount.toFixed(2);
}

export function formatPercentageForCSV(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

// Analytics-specific export functions
export function exportCategorySpendingCSV(data: any[], filters: any): string {
  const headers = ['Category', 'Total Amount', 'Transaction Count', 'Percentage of Total'];
  const csvData = data.map(item => ({
    'Category': item.category_name,
    'Total Amount': formatCurrencyForCSV(item.total_amount),
    'Transaction Count': item.transaction_count,
    'Percentage of Total': formatPercentageForCSV(item.percentage)
  }));
  
  return convertToCSV(csvData, headers);
}

export function exportCreditCardUsageCSV(data: any[], filters: any): string {
  const headers = ['Card Name', 'Type', 'Credit Limit', 'Current Balance', 'Available Credit', 'Usage %', 'Monthly Expenses'];
  const csvData = data.map(item => ({
    'Card Name': item.card_name,
    'Type': item.card_type.toUpperCase(),
    'Credit Limit': formatCurrencyForCSV(item.credit_limit),
    'Current Balance': formatCurrencyForCSV(item.current_balance),
    'Available Credit': formatCurrencyForCSV(item.available_credit),
    'Usage %': formatPercentageForCSV(item.usage_percentage),
    'Monthly Expenses': formatCurrencyForCSV(item.monthly_expenses)
  }));
  
  return convertToCSV(csvData, headers);
}

export function exportBankAccountsCSV(data: any[], filters: any): string {
  const headers = ['Account Name', 'Type', 'Current Balance', 'Available Balance', 'Monthly Income', 'Monthly Expenses'];
  const csvData = data.map(item => ({
    'Account Name': item.account_name,
    'Type': item.account_type,
    'Current Balance': formatCurrencyForCSV(item.current_balance),
    'Available Balance': formatCurrencyForCSV(item.available_balance),
    'Monthly Income': formatCurrencyForCSV(item.monthly_income),
    'Monthly Expenses': formatCurrencyForCSV(item.monthly_expenses)
  }));
  
  return convertToCSV(csvData, headers);
}

export function exportRecurringPaymentsCSV(data: any[], filters: any): string {
  const headers = ['Payment Type', 'Amount', 'Due Day', 'Frequency', 'Status', 'Category', 'Auto Pay'];
  const csvData = data.map(item => ({
    'Payment Type': item.payment_type,
    'Amount': formatCurrencyForCSV(item.amount),
    'Due Day': item.due_day,
    'Frequency': item.frequency,
    'Status': item.payment_status.replace('_', ' ').toUpperCase(),
    'Category': item.category_name,
    'Auto Pay': item.auto_pay ? 'Yes' : 'No'
  }));
  
  return convertToCSV(csvData, headers);
}

export function exportInstallmentsCSV(data: any[], filters: any): string {
  const headers = ['Item Name', 'Total Amount', 'Remaining Amount', 'Monthly Payment', 'Progress', 'Completion %', 'Status'];
  const csvData = data.map(item => ({
    'Item Name': item.item_name,
    'Total Amount': formatCurrencyForCSV(item.total_amount),
    'Remaining Amount': formatCurrencyForCSV(item.remaining_amount),
    'Monthly Payment': formatCurrencyForCSV(item.monthly_payment),
    'Progress': `${item.paid_installments}/${item.total_installments}`,
    'Completion %': formatPercentageForCSV(item.completion_percentage),
    'Status': item.payment_status.replace('_', ' ').toUpperCase()
  }));
  
  return convertToCSV(csvData, headers);
}

export function exportBudgetVsActualCSV(data: any[], filters: any): string {
  const headers = ['Budget Name', 'Category', 'Allocated Amount', 'Actual Spent', 'Remaining', 'Usage %', 'Status'];
  const csvData = data.map(item => ({
    'Budget Name': item.budget_name,
    'Category': item.category_name,
    'Allocated Amount': formatCurrencyForCSV(item.allocated_amount),
    'Actual Spent': formatCurrencyForCSV(item.actual_spent),
    'Remaining': formatCurrencyForCSV(item.allocated_amount - item.actual_spent),
    'Usage %': formatPercentageForCSV(item.usage_percentage),
    'Status': item.usage_percentage > 100 ? 'Over Budget' : 
              item.usage_percentage > 80 ? 'Near Limit' : 'On Track'
  }));
  
  return convertToCSV(csvData, headers);
}

export function exportHighValueTransactionsCSV(data: any[], filters: any): string {
  const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account'];
  const csvData = data.map(item => ({
    'Date': formatDateForCSV(item.date),
    'Description': item.description,
    'Amount': formatCurrencyForCSV(item.amount),
    'Type': item.type.charAt(0).toUpperCase() + item.type.slice(1),
    'Category': item.category_name,
    'Account': item.credit_card_name || item.bank_account_name || 'Cash'
  }));
  
  return convertToCSV(csvData, headers);
}

export function exportMonthlyTransactionsCSV(data: any[], filters: any): string {
  const headers = ['Month', 'Income', 'Expenses', 'Transfers', 'Transaction Count', 'Net Amount'];
  const csvData = data.map(item => ({
    'Month': item.month,
    'Income': formatCurrencyForCSV(item.income),
    'Expenses': formatCurrencyForCSV(item.expenses),
    'Transfers': formatCurrencyForCSV(item.transfers),
    'Transaction Count': item.transaction_count,
    'Net Amount': formatCurrencyForCSV(item.income - item.expenses)
  }));
  
  return convertToCSV(csvData, headers);
}

// Master export function for all analytics data
export function exportAllAnalyticsData(analyticsData: any, filters: any): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filterSuffix = filters.period !== 'month' ? `_${filters.period}` : '';
  
  // Export each section
  if (analyticsData.categorySpending?.length > 0) {
    const csv = exportCategorySpendingCSV(analyticsData.categorySpending, filters);
    downloadCSV(csv, `category_spending${filterSuffix}_${timestamp}.csv`);
  }
  
  if (analyticsData.creditCardUsage?.length > 0) {
    const csv = exportCreditCardUsageCSV(analyticsData.creditCardUsage, filters);
    downloadCSV(csv, `credit_card_usage${filterSuffix}_${timestamp}.csv`);
  }
  
  if (analyticsData.bankAccounts?.length > 0) {
    const csv = exportBankAccountsCSV(analyticsData.bankAccounts, filters);
    downloadCSV(csv, `bank_accounts${filterSuffix}_${timestamp}.csv`);
  }
  
  if (analyticsData.recurringPayments?.length > 0) {
    const csv = exportRecurringPaymentsCSV(analyticsData.recurringPayments, filters);
    downloadCSV(csv, `recurring_payments${filterSuffix}_${timestamp}.csv`);
  }
  
  if (analyticsData.installments?.length > 0) {
    const csv = exportInstallmentsCSV(analyticsData.installments, filters);
    downloadCSV(csv, `installments${filterSuffix}_${timestamp}.csv`);
  }
  
  if (analyticsData.budgetVsActual?.length > 0) {
    const csv = exportBudgetVsActualCSV(analyticsData.budgetVsActual, filters);
    downloadCSV(csv, `budget_vs_actual${filterSuffix}_${timestamp}.csv`);
  }
  
  if (analyticsData.highValueTransactions?.length > 0) {
    const csv = exportHighValueTransactionsCSV(analyticsData.highValueTransactions, filters);
    downloadCSV(csv, `high_value_transactions${filterSuffix}_${timestamp}.csv`);
  }
  
  if (analyticsData.monthlyTransactions?.length > 0) {
    const csv = exportMonthlyTransactionsCSV(analyticsData.monthlyTransactions, filters);
    downloadCSV(csv, `monthly_transactions${filterSuffix}_${timestamp}.csv`);
  }
}
