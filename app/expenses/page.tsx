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

  // Fetch initial data with error handling
  let expenses: any[] = [];
  let paymentMethods: any[] = [];
  let notifications: any[] = [];

  try {
    [expenses, paymentMethods, notifications] = await Promise.all([
      expenseService.getExpenses(user.id, { type: 'all' }).catch(err => {
        console.error('Error fetching expenses:', err);
        return [];
      }),
      expenseService.getPaymentMethods(user.id).catch(err => {
        console.error('Error fetching payment methods:', err);
        return [];
      }),
      expenseService.getPaymentNotifications(user.id).catch(err => {
        console.error('Error fetching notifications:', err);
        return [];
      })
    ]);
  } catch (error) {
    console.error('Error initializing expense service:', error);
    // Continue with empty arrays
  }

  return (
    <DashboardLayout
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
