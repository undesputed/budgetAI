'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewIncomeDialog } from './ViewIncomeDialog';
import { EditIncomeDialog } from './EditIncomeDialog';
import { IncomeTransaction } from '@/lib/services/expense-service-client';

interface IncomeTableProps {
  incomeTransactions: IncomeTransaction[];
  loading: boolean;
  onIncomeUpdated: () => void;
  onIncomeDeleted: () => void;
}

export function IncomeTable({ 
  incomeTransactions, 
  loading, 
  onIncomeUpdated, 
  onIncomeDeleted 
}: IncomeTableProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeTransaction | null>(null);

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

  // Handle view income
  const handleViewIncome = (income: IncomeTransaction) => {
    setSelectedIncome(income);
    setViewDialogOpen(true);
  };

  // Handle edit income
  const handleEditIncome = (income: IncomeTransaction) => {
    setSelectedIncome(income);
    setEditDialogOpen(true);
  };

  // Handle delete income
  const handleDeleteIncome = async (income: IncomeTransaction) => {
    if (confirm('Are you sure you want to delete this income transaction?')) {
      const expenseService = (await import('@/lib/services/expense-service-client')).createExpenseServiceClient();
      const success = await expenseService.deleteIncome(income.user_id, income.id);
      if (success) {
        onIncomeDeleted();
      }
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (incomeTransactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No income transactions found</h3>
        <p className="text-gray-500 mb-4">
          Start by adding your first income transaction to track your earnings.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeTransactions.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="font-medium">
                  {format(new Date(income.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getIncomeIcon(income.income_type)}</span>
                    <span className="font-medium">{income.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {income.income_type_label || income.income_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {income.category_name ? (
                    <div className="flex items-center gap-2">
                      {income.category_color && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: income.category_color }}
                        />
                      )}
                      <span>{income.category_name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell className="font-semibold text-green-600">
                  {formatCurrency(income.amount)}
                </TableCell>
                <TableCell>
                  {income.income_source || (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(income.status)}>
                    {income.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewIncome(income)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditIncome(income)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteIncome(income)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {selectedIncome && (
        <>
          <ViewIncomeDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            income={selectedIncome}
          />
          
          <EditIncomeDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            income={selectedIncome}
            onIncomeUpdated={onIncomeUpdated}
          />
        </>
      )}
    </>
  );
}
