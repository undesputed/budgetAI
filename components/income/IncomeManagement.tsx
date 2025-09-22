'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Plus, Filter, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncomeTable } from './IncomeTable';
import { AddIncomeDialog } from './AddIncomeDialog';
import { IncomeFilters } from './IncomeFilters';
import { ExportDialog } from './ExportDialog';
import { ErrorRecoveryCard } from '@/components/errors/ErrorRecoveryCard';
import { createExpenseServiceClient, IncomeTransaction, IncomeFilters as IncomeFiltersType } from '@/lib/services/expense-service-client';
import { AppError, ErrorState } from '@/lib/errors/error-types';
import { ErrorHandler } from '@/lib/errors/error-handler';

interface IncomeManagementProps {
  user: User;
  initialData: {
    income: IncomeTransaction[];
    categories: any[];
    paymentMethods: any[];
    errors: {
      income?: AppError;
      categories?: AppError;
      paymentMethods?: AppError;
      general?: AppError;
    };
    hasErrors: boolean;
  };
}

export function IncomeManagement({ user, initialData }: IncomeManagementProps) {
  const [incomeTransactions, setIncomeTransactions] = useState<IncomeTransaction[]>(initialData.income);
  const [filteredIncome, setFilteredIncome] = useState<IncomeTransaction[]>(initialData.income);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<IncomeFiltersType>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Enhanced error state management
  const [errorState, setErrorState] = useState<ErrorState>({
    hasErrors: initialData.hasErrors,
    errors: initialData.errors,
    retryable: true
  });

  const expenseService = createExpenseServiceClient();

  // Fetch income transactions with enhanced error handling
  const fetchIncomeTransactions = async () => {
    try {
      setLoading(true);
      setErrorState(prev => ({ ...prev, hasErrors: false, errors: {} }));
      
      const data = await ErrorHandler.withRetry(() => 
        expenseService.getIncomeTransactions(user.id, filters)
      );
      
      setIncomeTransactions(data);
      setFilteredIncome(data);
    } catch (error) {
      const appError = ErrorHandler.handleError(error, { 
        userId: user.id, 
        filters, 
        operation: 'fetchIncomeTransactions' 
      });
      
      setErrorState({
        hasErrors: true,
        errors: { income: appError },
        retryable: appError.retryable
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  const applySearchFilter = (transactions: IncomeTransaction[], search: string) => {
    if (!search.trim()) return transactions;
    
    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.income_source?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category_name?.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Apply tab filter
  const applyTabFilter = (transactions: IncomeTransaction[], tab: string) => {
    if (tab === 'all') return transactions;
    return transactions.filter(transaction => transaction.income_type === tab);
  };

  // Update filtered income when data, search, or tab changes
  useEffect(() => {
    let filtered = applySearchFilter(incomeTransactions, searchTerm);
    filtered = applyTabFilter(filtered, activeTab);
    setFilteredIncome(filtered);
  }, [incomeTransactions, searchTerm, activeTab]);

  // Error recovery handler
  const handleErrorRecovery = async () => {
    await fetchIncomeTransactions();
  };

  // Dismiss error handler
  const handleDismissError = () => {
    setErrorState(prev => ({ ...prev, hasErrors: false, errors: {} }));
  };

  // Fetch data when filters change (initial data is already loaded)
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchIncomeTransactions();
    }
  }, [filters]);

  // Handle income creation
  const handleIncomeCreated = () => {
    fetchIncomeTransactions();
    setShowAddDialog(false);
  };

  // Handle income update
  const handleIncomeUpdated = () => {
    fetchIncomeTransactions();
  };

  // Handle income deletion
  const handleIncomeDeleted = () => {
    fetchIncomeTransactions();
  };

  // Handle export
  const handleExportIncome = () => {
    setShowExportDialog(true);
  };

  // Get tab counts
  const getTabCounts = () => {
    const counts = {
      all: incomeTransactions.length,
      general: incomeTransactions.filter(t => t.income_type === 'general').length,
      recurring: incomeTransactions.filter(t => t.income_type === 'recurring').length,
      refund: incomeTransactions.filter(t => t.income_type === 'refund').length,
      transfer: incomeTransactions.filter(t => t.income_type === 'transfer').length
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  return (
    <div className="space-y-6">
      {/* Error Recovery Card */}
      {errorState.hasErrors && (
        <ErrorRecoveryCard
          errors={errorState.errors}
          onRetry={handleErrorRecovery}
          onDismiss={handleDismissError}
          retryable={errorState.retryable}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income</h1>
          <p className="text-gray-600 mt-1">Manage your income transactions and track your earnings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Income
          </Button>
          
          <Button variant="outline" onClick={handleExportIncome} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search income transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <IncomeFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Income Table */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="h-auto p-0 bg-transparent">
                <TabsTrigger value="all" className="px-6 py-3">
                  All Income ({tabCounts.all})
                </TabsTrigger>
                <TabsTrigger value="general" className="px-6 py-3">
                  General ({tabCounts.general})
                </TabsTrigger>
                <TabsTrigger value="recurring" className="px-6 py-3">
                  Recurring ({tabCounts.recurring})
                </TabsTrigger>
                <TabsTrigger value="refund" className="px-6 py-3">
                  Refund ({tabCounts.refund})
                </TabsTrigger>
                <TabsTrigger value="transfer" className="px-6 py-3">
                  Transfer ({tabCounts.transfer})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              <IncomeTable
                incomeTransactions={filteredIncome}
                loading={loading}
                onIncomeUpdated={handleIncomeUpdated}
                onIncomeDeleted={handleIncomeDeleted}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddIncomeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        userId={user.id}
        onIncomeCreated={handleIncomeCreated}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={filteredIncome}
        dataType="income"
        filters={filters}
      />
    </div>
  );
}
