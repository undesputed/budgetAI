"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Filter, 
  Download, 
  Bell, 
  CreditCard, 
  Calendar, 
  RotateCcw, 
  ShoppingCart,
  AlertCircle
} from "lucide-react";
import { ExpenseTransaction, PaymentMethod, PaymentNotification, ExpenseFilters } from "@/lib/services/expense-service-client";
import { ExpenseTable } from "./ExpenseTable";
import { ExpenseFilters as ExpenseFiltersComponent } from "./ExpenseFilters";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { PaymentNotifications } from "./PaymentNotifications";
import { PaymentMethodDialog } from "./PaymentMethodDialog";
import { InstallmentManagement } from "./InstallmentManagement";
import { ExportDialog } from "./ExportDialog";

interface ExpenseManagementProps {
  user: User;
  initialExpenses: ExpenseTransaction[];
  paymentMethods: PaymentMethod[];
  notifications: PaymentNotification[];
}

export function ExpenseManagement({ 
  user, 
  initialExpenses, 
  paymentMethods: initialPaymentMethods, 
  notifications 
}: ExpenseManagementProps) {
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>(initialExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseTransaction[]>(initialExpenses);
  const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Filter expenses based on active tab and filters
  useEffect(() => {
    let filtered = expenses;

    // Filter by tab
    if (activeTab !== "all") {
      switch (activeTab) {
        case "expenses":
          filtered = filtered.filter(e => e.expense_type === "Expense");
          break;
        case "credit-card":
          filtered = filtered.filter(e => e.expense_type === "Credit Card Payment");
          break;
        case "installments":
          filtered = filtered.filter(e => e.expense_type === "Installment Payment");
          break;
        case "recurring":
          filtered = filtered.filter(e => e.expense_type === "Recurring Payment");
          break;
      }
    }

    // Apply additional filters
    if (filters.category) {
      filtered = filtered.filter(e => e.category_name === filters.category);
    }
    if (filters.payment_method) {
      filtered = filtered.filter(e => e.payment_method_name === filters.payment_method);
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    if (filters.date_from) {
      filtered = filtered.filter(e => e.date >= filters.date_from!);
    }
    if (filters.date_to) {
      filtered = filtered.filter(e => e.date <= filters.date_to!);
    }
    if (filters.amount_min) {
      filtered = filtered.filter(e => e.amount >= filters.amount_min!);
    }
    if (filters.amount_max) {
      filtered = filtered.filter(e => e.amount <= filters.amount_max!);
    }

    setFilteredExpenses(filtered);
  }, [expenses, activeTab, filters]);

  // Calculate summary statistics
  const getSummaryStats = () => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  };

  const summaryStats = getSummaryStats();
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // Get unique categories and payment methods for filters
  const categories = [...new Set(expenses.map(e => e.category_name).filter(Boolean))] as string[];
  const paymentMethodNames = [...new Set(expenses.map(e => e.payment_method_name).filter(Boolean))] as string[];

  const handleAddExpense = (newExpense: ExpenseTransaction) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleUpdateExpense = (updatedExpense: ExpenseTransaction) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  const handleExportExpenses = () => {
    try {
      // Import CSV utilities dynamically to avoid SSR issues
      import('@/lib/utils/csv-export').then(({ convertToCSV, downloadCSV, formatDateForCSV }) => {
        // Prepare data for export
        const exportData = filteredExpenses.map(expense => ({
          'Date': formatDateForCSV(expense.date),
          'Description': expense.description || '',
          'Amount': expense.amount,
          'Category': expense.category_name || '',
          'Payment Method': expense.payment_method_name || '',
          'Type': expense.expense_type || '',
          'Status': expense.status || '',
          'Notes': expense.notes || '',
          'Receipt URL': expense.receipt_url || '',
          'Installment Info': expense.installment_number && expense.installment_total 
            ? `${expense.installment_number}/${expense.installment_total}` 
            : '',
          'Created At': formatDateForCSV(expense.created_at)
        }));

        // Define CSV headers
        const headers = [
          'Date',
          'Description', 
          'Amount',
          'Category',
          'Payment Method',
          'Type',
          'Status',
          'Notes',
          'Receipt URL',
          'Installment Info',
          'Created At'
        ];

        // Generate CSV content
        const csvContent = convertToCSV(exportData, headers);
        
        // Generate filename with current date
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `expenses_${currentDate}.csv`;
        
        // Download the CSV file
        downloadCSV(csvContent, filename);
      });
    } catch (error) {
      console.error('Error exporting expenses:', error);
      alert('Failed to export expenses. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003366]">Expense Management</h1>
          <p className="text-[#00509e] mt-1">
            Track and manage all your financial outflows
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(true)}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Add Expense Button */}
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-[#007acc] hover:bg-[#00509e] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Payment Methods Section */}
      <Card className="corporate-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <p className="text-sm text-[#00509e] mt-1">
                Manage your payment methods for expense tracking
              </p>
            </div>
            <Button
              onClick={() => setShowPaymentMethodDialog(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userPaymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userPaymentMethods.slice(0, 6).map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                >
                  <CreditCard className="h-4 w-4 text-[#007acc]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{method.name}</p>
                    <p className="text-xs text-gray-600 capitalize">
                      {method.type.replace('_', ' ')}
                    </p>
                  </div>
                  {!method.is_active && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                </div>
              ))}
              {userPaymentMethods.length > 6 && (
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-dashed">
                  <p className="text-sm text-gray-600">
                    +{userPaymentMethods.length - 6} more
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">No payment methods configured</p>
              <Button
                onClick={() => setShowPaymentMethodDialog(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="corporate-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00509e]">
              Total Expenses
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#007acc]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#003366]">
              ${summaryStats.total.toLocaleString()}
            </div>
            <p className="text-xs text-[#00509e]">
              {summaryStats.count} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="corporate-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00509e]">
              Average Expense
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-[#007acc]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#003366]">
              ${summaryStats.average.toLocaleString()}
            </div>
            <p className="text-xs text-[#00509e]">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="corporate-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00509e]">
              Pending Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-[#007acc]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#003366]">
              {unreadNotifications}
            </div>
            <p className="text-xs text-[#00509e]">
              Due payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="corporate-shadow">
          <CardHeader>
            <CardTitle className="text-lg text-[#003366]">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              paymentMethods={paymentMethodNames}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content - Tabbed Interface */}
      <Card className="corporate-shadow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-[#cce0ff] px-4 pt-4">
            <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0 gap-2">
              <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 data-[state=active]:bg-[#007acc] data-[state=active]:text-white"
              >
                All Expenses
                <Badge variant="secondary" className="ml-1">
                  {expenses.length}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="expenses" 
                className="flex items-center gap-2 data-[state=active]:bg-[#007acc] data-[state=active]:text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                Expenses
                <Badge variant="secondary" className="ml-1">
                  {expenses.filter(e => e.expense_type === "Expense").length}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="credit-card" 
                className="flex items-center gap-2 data-[state=active]:bg-[#007acc] data-[state=active]:text-white"
              >
                <CreditCard className="h-4 w-4" />
                Credit Card
                <Badge variant="secondary" className="ml-1">
                  {expenses.filter(e => e.expense_type === "Credit Card Payment").length}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="installments" 
                className="flex items-center gap-2 data-[state=active]:bg-[#007acc] data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                Installments
                <Badge variant="secondary" className="ml-1">
                  {expenses.filter(e => e.expense_type === "Installment Payment").length}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="recurring" 
                className="flex items-center gap-2 data-[state=active]:bg-[#007acc] data-[state=active]:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Recurring
                <Badge variant="secondary" className="ml-1">
                  {expenses.filter(e => e.expense_type === "Recurring Payment").length}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="installment-plans" 
                className="flex items-center gap-2 data-[state=active]:bg-[#007acc] data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                Installment Plans
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <ExpenseTable
              expenses={filteredExpenses}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              paymentMethods={userPaymentMethods}
            />
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <ExpenseTable
              expenses={filteredExpenses}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              paymentMethods={userPaymentMethods}
            />
          </TabsContent>

          <TabsContent value="credit-card" className="mt-6">
            <ExpenseTable
              expenses={filteredExpenses}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              paymentMethods={userPaymentMethods}
            />
          </TabsContent>

          <TabsContent value="installments" className="mt-6">
            <ExpenseTable
              expenses={filteredExpenses}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              paymentMethods={userPaymentMethods}
            />
          </TabsContent>

          <TabsContent value="recurring" className="mt-6">
            <ExpenseTable
              expenses={filteredExpenses}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              paymentMethods={userPaymentMethods}
            />
          </TabsContent>
          
          <TabsContent value="installment-plans" className="mt-6 px-4 pb-4">
            <InstallmentManagement userId={user.id} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onExpenseAdded={handleAddExpense}
        paymentMethods={userPaymentMethods}
        userId={user.id}
      />

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={showPaymentMethodDialog}
        onOpenChange={setShowPaymentMethodDialog}
        paymentMethods={userPaymentMethods}
        onPaymentMethodsUpdated={setUserPaymentMethods}
        userId={user.id}
      />

      {/* Payment Notifications Dialog */}
      <PaymentNotifications
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={notifications}
        userId={user.id}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        expenses={expenses}
        filteredExpenses={filteredExpenses}
      />
    </div>
  );
}
