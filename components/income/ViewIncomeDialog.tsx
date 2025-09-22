'use client';

import { format } from 'date-fns';
import { Calendar, DollarSign, Building, CreditCard, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IncomeTransaction } from '@/lib/services/expense-service-client';

interface ViewIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: IncomeTransaction;
}

export function ViewIncomeDialog({ open, onOpenChange, income }: ViewIncomeDialogProps) {
  // Get income icon based on type
  const getIncomeIcon = (incomeType: string) => {
    switch (incomeType) {
      case 'general':
        return '💼';
      case 'recurring':
        return '🔄';
      case 'refund':
        return '💸';
      case 'transfer':
        return '🔄';
      default:
        return '💰';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getIncomeIcon(income.income_type)}</span>
            Income Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this income transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{income.description}</h3>
              <Badge variant={getStatusBadgeVariant(income.status)}>
                {income.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
              <DollarSign className="h-6 w-6" />
              {formatCurrency(income.amount)}
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Transaction Details</h4>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(income.date), 'EEEE, MMMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Income Type */}
              <div className="flex items-center gap-3">
                <span className="text-lg">{getIncomeIcon(income.income_type)}</span>
                <div>
                  <p className="text-sm font-medium">Income Type</p>
                  <p className="text-sm text-gray-600">
                    {income.income_type_label || income.income_type}
                  </p>
                </div>
              </div>

              {/* Category */}
              {income.category_name && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: income.category_color || '#6b7280' }}
                  />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-gray-600">{income.category_name}</p>
                  </div>
                </div>
              )}

              {/* Income Source */}
              {income.income_source && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Income Source</p>
                    <p className="text-sm text-gray-600">{income.income_source}</p>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {income.payment_method_name && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm text-gray-600">{income.payment_method_name}</p>
                  </div>
                </div>
              )}

              {/* Bank Account */}
              {income.bank_account_name && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Bank Account</p>
                    <p className="text-sm text-gray-600">{income.bank_account_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {income.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Notes</h4>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {income.notes}
                </p>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="space-y-2 text-xs text-gray-500">
            <p>Created: {format(new Date(income.created_at), 'MMM dd, yyyy HH:mm')}</p>
            {income.updated_at !== income.created_at && (
              <p>Updated: {format(new Date(income.updated_at), 'MMM dd, yyyy HH:mm')}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
