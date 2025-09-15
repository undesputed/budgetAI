import { createClient } from "@/lib/supabase/server";
import { 
  getCachedDashboardSummary,
  getCachedRecentTransactions,
  getCachedCreditCards,
  getCachedExpenseCategories
} from "./cached-data-server";

// Types for dashboard data
export interface DashboardSummary {
  totalExpenses: number;
  totalIncome: number;
  totalTransactions: number;
  totalBudgetRemaining: number;
  totalBudget: number;
  totalCreditCards: number;
  totalBankAccounts: number;
  totalCreditLimit: number;
  totalCreditBalance: number;
  totalAvailableCredit: number;
  totalBankBalance: number;
  totalAvailableBankBalance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense' | 'transfer' | 'payment';
  date: string;
  category: string;
  notes?: string;
}

export interface CreditCard {
  id: string;
  card_name: string;
  card_type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  last_four_digits: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  usage_percentage: number;
}

export interface Installment {
  id: string;
  item_name: string;
  remaining_amount: number;
  due_date: string;
  monthly_payment: number;
  total_installments: number;
  paid_installments: number;
}

export interface RecurringPayment {
  id: string;
  payment_type: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  description: string;
}

export interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  expenses: number;
  transactions: number;
  transfers: number;
  budget: number;
}

// Server-side data fetching function for dashboard with caching
export async function fetchDashboardData(userId: string) {
  try {
    const supabase = await createClient();
    
    // Fetch cached data and non-cached data in parallel for better performance
    const [
      summary,
      recentTransactions,
      creditCards,
      expenseCategories,
      installments,
      recurringPayments,
      monthlyTrends
    ] = await Promise.all([
      getCachedDashboardSummary(userId, supabase),
      getCachedRecentTransactions(userId, 5, supabase),
      getCachedCreditCards(userId, 5, supabase),
      getCachedExpenseCategories(userId, supabase),
      getInstallments(supabase, userId, 5),
      getRecurringPayments(supabase, userId, 5),
      getMonthlyTrends(supabase, userId, 6)
    ]);

    return {
      summary,
      recentTransactions,
      creditCards,
      installments,
      recurringPayments,
      expenseCategories,
      monthlyTrends,
      error: null
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      summary: getEmptySummary(),
      recentTransactions: [],
      creditCards: [],
      installments: [],
      recurringPayments: [],
      expenseCategories: [],
      monthlyTrends: getEmptyMonthlyTrends(6),
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
    };
  }
}


// Individual data fetching functions
async function getDashboardSummary(supabase: any, userId: string): Promise<DashboardSummary> {
  try {
    const { data, error } = await supabase
      .from('user_dashboard_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching dashboard summary:', error);
      return getEmptySummary();
    }

    if (!data) {
      return getEmptySummary();
    }

    // Calculate budget remaining (assuming a default budget if none exists)
    const totalBudget = 3000; // Default budget, can be made dynamic later
    const totalBudgetRemaining = Math.max(0, totalBudget - (data.total_expenses || 0));

    return {
      totalExpenses: data.total_expenses || 0,
      totalIncome: data.total_income || 0,
      totalTransactions: data.total_transactions || 0,
      totalBudgetRemaining,
      totalBudget,
      totalCreditCards: data.total_credit_cards || 0,
      totalBankAccounts: data.total_bank_accounts || 0,
      totalCreditLimit: data.total_credit_limit || 0,
      totalCreditBalance: data.total_credit_balance || 0,
      totalAvailableCredit: data.total_available_credit || 0,
      totalBankBalance: data.total_bank_balance || 0,
      totalAvailableBankBalance: data.total_available_bank_balance || 0,
    };
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    return getEmptySummary();
  }
}

async function getRecentTransactions(supabase: any, userId: string, limit: number = 5): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        description,
        type,
        date,
        notes,
        categories (
          name
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return (data || []).map((transaction: any) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      date: transaction.date,
      category: (transaction.categories as any)?.name || 'Uncategorized',
      notes: transaction.notes,
    }));
  } catch (error) {
    console.error('Error in getRecentTransactions:', error);
    return [];
  }
}

async function getCreditCards(supabase: any, userId: string, limit: number = 5): Promise<CreditCard[]> {
  try {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching credit cards:', error);
      return [];
    }

    return (data || []).map((card: any) => ({
      id: card.id,
      card_name: card.card_name,
      card_type: card.card_type,
      last_four_digits: card.last_four_digits,
      credit_limit: card.credit_limit,
      current_balance: card.current_balance,
      available_credit: card.available_credit,
      usage_percentage: card.credit_limit > 0 ? (card.current_balance / card.credit_limit) * 100 : 0,
    }));
  } catch (error) {
    console.error('Error in getCreditCards:', error);
    return [];
  }
}

async function getInstallments(supabase: any, userId: string, limit: number = 5): Promise<Installment[]> {
  try {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching installments:', error);
      return [];
    }

    return (data || []).map((installment: any) => ({
      id: installment.id,
      item_name: installment.item_name,
      remaining_amount: installment.remaining_amount,
      due_date: installment.due_date,
      monthly_payment: installment.monthly_payment,
      total_installments: installment.total_installments,
      paid_installments: installment.paid_installments,
    }));
  } catch (error) {
    console.error('Error in getInstallments:', error);
    return [];
  }
}

async function getRecurringPayments(supabase: any, userId: string, limit: number = 5): Promise<RecurringPayment[]> {
  try {
    const { data, error } = await supabase
      .from('recurring_payments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('due_day', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching recurring payments:', error);
      return [];
    }

    // For now, we'll simulate status based on due date
    const currentDate = new Date();
    const currentDay = currentDate.getDate();

    return (data || []).map((payment: any) => {
      let status: 'paid' | 'pending' | 'overdue' = 'pending';
      
      if (payment.due_day < currentDay) {
        status = 'overdue';
      } else if (payment.due_day === currentDay) {
        status = 'pending';
      } else {
        status = 'pending';
      }

      return {
        id: payment.id,
        payment_type: payment.payment_type,
        amount: payment.amount,
        status,
        due_date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(payment.due_day).padStart(2, '0')}`,
        description: payment.description || '',
      };
    });
  } catch (error) {
    console.error('Error in getRecurringPayments:', error);
    return [];
  }
}

async function getExpenseCategories(supabase: any, userId: string): Promise<ExpenseCategory[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        categories (
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', getCurrentMonthStart())
      .lte('date', getCurrentMonthEnd());

    if (error) {
      console.error('Error fetching expense categories:', error);
      return [];
    }

    // Group by category and sum amounts
    const categoryTotals = (data || []).reduce((acc: Record<string, ExpenseCategory>, transaction: any) => {
      const categoryName = (transaction.categories as any)?.name || 'Uncategorized';
      const categoryColor = (transaction.categories as any)?.color || '#007acc';
      
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, value: 0, color: categoryColor };
      }
      acc[categoryName].value += transaction.amount;
      return acc;
    }, {} as Record<string, ExpenseCategory>);

    return Object.values(categoryTotals);
  } catch (error) {
    console.error('Error in getExpenseCategories:', error);
    return [];
  }
}

async function getMonthlyTrends(supabase: any, userId: string, months: number = 6): Promise<MonthlyTrend[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .gte('date', getMonthsAgoStart(months))
      .lte('date', getCurrentMonthEnd())
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching monthly trends:', error);
      return getEmptyMonthlyTrends(months);
    }

    // Group by month and calculate totals
    const monthlyData = (data || []).reduce((acc: Record<string, MonthlyTrend>, transaction: any) => {
      const monthKey = transaction.date.substring(0, 7); // YYYY-MM format
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: formatMonthKey(monthKey),
          expenses: 0,
          transactions: 0,
          transfers: 0,
          budget: 3000, // Default budget
        };
      }

      acc[monthKey].transactions += 1;
      
      switch (transaction.type) {
        case 'expense':
          acc[monthKey].expenses += transaction.amount;
          break;
        case 'transfer':
          acc[monthKey].transfers += transaction.amount;
          break;
      }

      return acc;
    }, {} as Record<string, MonthlyTrend>);

    return (Object.values(monthlyData) as MonthlyTrend[]).sort((a: MonthlyTrend, b: MonthlyTrend) => {
      const monthOrder = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
  } catch (error) {
    console.error('Error in getMonthlyTrends:', error);
    return getEmptyMonthlyTrends(months);
  }
}

// Helper functions
function getEmptySummary(): DashboardSummary {
  return {
    totalExpenses: 0,
    totalIncome: 0,
    totalTransactions: 0,
    totalBudgetRemaining: 3000,
    totalBudget: 3000,
    totalCreditCards: 0,
    totalBankAccounts: 0,
    totalCreditLimit: 0,
    totalCreditBalance: 0,
    totalAvailableCredit: 0,
    totalBankBalance: 0,
    totalAvailableBankBalance: 0,
  };
}

function getEmptyMonthlyTrends(months: number): MonthlyTrend[] {
  const trends: MonthlyTrend[] = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    trends.push({
      month: monthNames[date.getMonth()],
      expenses: 0,
      transactions: 0,
      transfers: 0,
      budget: 3000,
    });
  }
  
  return trends;
}

function getCurrentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getCurrentMonthEnd(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function getMonthsAgoStart(months: number): string {
  const now = new Date();
  const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months, 1);
  return `${monthsAgo.getFullYear()}-${String(monthsAgo.getMonth() + 1).padStart(2, '0')}-01`;
}

function formatMonthKey(monthKey: string): string {
  const [, month] = monthKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[parseInt(month) - 1];
}

// Types are already exported as interfaces above
