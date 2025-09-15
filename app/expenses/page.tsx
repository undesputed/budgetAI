import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { ExpenseManagement } from "@/components/expenses/ExpenseManagement";
import { createExpenseService } from "@/lib/services/expense-service";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Initialize expense service
  const expenseService = await createExpenseService();

  // Fetch initial data
  const [expenses, paymentMethods, notifications] = await Promise.all([
    expenseService.getExpenses(user.id, { type: 'all' }),
    expenseService.getPaymentMethods(user.id),
    expenseService.getPaymentNotifications(user.id)
  ]);

  return (
    <DashboardLayout
      title="Expenses"
      subtitle="Manage all your expenses, payments, and financial outflows"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Expenses", isActive: true }
      ]}
    >
      <ExpenseManagement 
        user={user}
        initialExpenses={expenses}
        paymentMethods={paymentMethods}
        notifications={notifications}
      />
    </DashboardLayout>
  );
}
