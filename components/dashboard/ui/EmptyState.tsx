import { Plus, CreditCard, Receipt, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-[#cce0ff] rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#00509e]" />
      </div>
      <h3 className="text-lg font-semibold text-[#003366] mb-2">{title}</h3>
      <p className="text-[#00509e] mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-[#007acc] hover:bg-[#00509e]">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Specific empty states for different sections
export function EmptyTransactions() {
  return (
    <EmptyState
      title="No transactions yet"
      description="Start tracking your expenses and income to see them here."
      icon={Receipt}
      actionLabel="Add Transaction"
      onAction={() => console.log('Add transaction')}
    />
  );
}

export function EmptyCreditCards() {
  return (
    <EmptyState
      title="No credit cards added"
      description="Add your credit cards to track balances and usage."
      icon={CreditCard}
      actionLabel="Add Credit Card"
      onAction={() => console.log('Add credit card')}
    />
  );
}

export function EmptyInstallments() {
  return (
    <EmptyState
      title="No installments"
      description="Add installment plans to track your payment progress."
      icon={Calendar}
      actionLabel="Add Installment"
      onAction={() => console.log('Add installment')}
    />
  );
}

export function EmptyRecurringPayments() {
  return (
    <EmptyState
      title="No recurring payments"
      description="Add your monthly bills and subscriptions to track them."
      icon={TrendingUp}
      actionLabel="Add Recurring Payment"
      onAction={() => console.log('Add recurring payment')}
    />
  );
}

export function EmptyExpenseCategories() {
  return (
    <EmptyState
      title="No expenses this month"
      description="Your expense categories will appear here once you start spending."
      icon={Receipt}
    />
  );
}
