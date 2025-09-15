"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { ExpenseTransaction } from "@/lib/services/expense-service-client";
import { createExpenseServiceClient } from "@/lib/services/expense-service-client";

interface DeleteExpenseDialogProps {
  expense: ExpenseTransaction | null;
  onClose: () => void;
  onExpenseDeleted: (expenseId: string) => void;
}

export function DeleteExpenseDialog({
  expense,
  onClose,
  onExpenseDeleted
}: DeleteExpenseDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!expense) return;

    setLoading(true);
    try {
      const expenseService = createExpenseServiceClient();
      const success = await expenseService.deleteExpense(expense.id);

      if (success) {
        onExpenseDeleted(expense.id);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return null;

  return (
    <Dialog open={!!expense} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Expense
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="font-medium">{expense.description}</div>
            <div className="text-sm text-gray-600">
              Amount: ${expense.amount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Date: {new Date(expense.date).toLocaleDateString()}
            </div>
            {expense.category_name && (
              <div className="text-sm text-gray-600">
                Category: {expense.category_name}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
