"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  CreditCard, 
  RotateCcw, 
  ShoppingCart,
  Receipt,
  ExternalLink
} from "lucide-react";
import { ExpenseTransaction } from "@/lib/services/expense-service-client";

interface ViewExpenseDialogProps {
  expense: ExpenseTransaction | null;
  onClose: () => void;
}

export function ViewExpenseDialog({
  expense,
  onClose
}: ViewExpenseDialogProps) {
  if (!expense) return null;

  const getExpenseIcon = (expenseType: string) => {
    switch (expenseType) {
      case 'Credit Card Payment':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'Installment Payment':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'Recurring Payment':
        return <RotateCcw className="h-5 w-5 text-green-600" />;
      default:
        return <ShoppingCart className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={!!expense} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getExpenseIcon(expense.expense_type || 'Expense')}
            Expense Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this expense.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-lg font-medium">{expense.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-bold text-[#003366]">{formatCurrency(expense.amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(expense.date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="flex items-center gap-2 mt-1">
                  {getExpenseIcon(expense.expense_type || 'Expense')}
                  {expense.expense_type || 'Expense'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category and Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  {expense.category_name ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: expense.category_color || '#6b7280' }}
                      />
                      <span>{expense.category_name}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400">Uncategorized</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p>{expense.payment_method_name || 'Not specified'}</p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Installment Information */}
          {expense.installment_number && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Installment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Progress</label>
                    <p className="text-lg font-medium">
                      {expense.installment_number} of {expense.installment_total || 0} payments
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Remaining</label>
                    <p className="text-lg font-medium">
                      {(expense.installment_total || 0) - (expense.installment_number || 0)} payments left
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {expense.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{expense.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Receipt */}
          {expense.receipt_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  asChild
                  className="flex items-center gap-2"
                >
                  <a 
                    href={expense.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Receipt
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Created</label>
                  <p>{new Date(expense.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Last Updated</label>
                  <p>{new Date(expense.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
