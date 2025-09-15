"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Receipt,
  Calendar,
  CreditCard,
  RotateCcw,
  ShoppingCart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpenseTransaction, PaymentMethod } from "@/lib/services/expense-service-client";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";
import { ViewExpenseDialog } from "./ViewExpenseDialog";

interface ExpenseTableProps {
  expenses: ExpenseTransaction[];
  onUpdateExpense: (expense: ExpenseTransaction) => void;
  onDeleteExpense: (expenseId: string) => void;
  paymentMethods: PaymentMethod[];
}

export function ExpenseTable({ 
  expenses, 
  onUpdateExpense, 
  onDeleteExpense, 
  paymentMethods 
}: ExpenseTableProps) {
  const [editingExpense, setEditingExpense] = useState<ExpenseTransaction | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseTransaction | null>(null);
  const [viewingExpense, setViewingExpense] = useState<ExpenseTransaction | null>(null);

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

  const getExpenseIcon = (expenseType: string) => {
    switch (expenseType) {
      case 'Credit Card Payment':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'Installment Payment':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'Recurring Payment':
        return <RotateCcw className="h-4 w-4 text-green-600" />;
      default:
        return <ShoppingCart className="h-4 w-4 text-gray-600" />;
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-500">
          {expenses.length === 0 
            ? "Start by adding your first expense to track your spending."
            : "Try adjusting your filters to see more results."
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getExpenseIcon(expense.expense_type)}
                    <span className="text-sm font-medium text-gray-600">
                      {expense.expense_type}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {formatDate(expense.date)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="max-w-[300px]">
                    <div className="font-medium text-gray-900 truncate">
                      {expense.description}
                    </div>
                    {expense.installment_number && (
                      <div className="text-xs text-gray-500">
                        Payment {expense.installment_number} of {expense.installment_total}
                      </div>
                    )}
                    {expense.notes && (
                      <div className="text-xs text-gray-500 truncate">
                        {expense.notes}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {expense.category_name ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: expense.category_color || '#6b7280' }}
                      />
                      <span className="text-sm">{expense.category_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Uncategorized</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {expense.payment_method_name || 'Not specified'}
                  </div>
                  {expense.credit_card_name && (
                    <div className="text-xs text-gray-500">
                      {expense.credit_card_name} ****{expense.credit_card_last_four}
                    </div>
                  )}
                  {expense.bank_account_name && (
                    <div className="text-xs text-gray-500">
                      {expense.bank_account_name}
                    </div>
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </div>
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(expense.status)}
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingExpense(expense)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {expense.receipt_url && (
                        <DropdownMenuItem asChild>
                          <a 
                            href={expense.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            View Receipt
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeletingExpense(expense)}
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

      {/* Edit Expense Dialog */}
      <EditExpenseDialog
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onExpenseUpdated={onUpdateExpense}
        paymentMethods={paymentMethods}
      />

      {/* Delete Expense Dialog */}
      <DeleteExpenseDialog
        expense={deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onExpenseDeleted={onDeleteExpense}
      />

      {/* View Expense Dialog */}
      <ViewExpenseDialog
        expense={viewingExpense}
        onClose={() => setViewingExpense(null)}
      />
    </>
  );
}
