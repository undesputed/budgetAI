import { createClient } from "@/lib/supabase/server";
import { 
  getCachedMonthlyTransactions,
  getCachedCategorySpending
} from "./cached-data-server";

// Types for analytics data
export interface AnalyticsFilters {
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  account: string;
  category: string;
  startDate?: string;
  endDate?: string;
}

export interface MonthlyTransactionData {
  month: string;
  income: number;
  expenses: number;
  transfers: number;
  transaction_count: number;
}

export interface CategorySpendingData {
  category_id: string;
  category_name: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  avg_amount: number;
  month: string;
}

export interface CreditCardUsageData {
  card_id: string;
  card_name: string;
  card_type: string;
  last_four_digits: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  usage_percentage: number;
  monthly_expenses: number;
}

export interface BankAccountData {
  account_id: string;
  account_name: string;
  account_type: string;
  account_number_masked: string;
  current_balance: number;
  available_balance: number;
  monthly_income: number;
  monthly_expenses: number;
}

export interface RecurringPaymentData {
  payment_id: string;
  payment_type: string;
  amount: number;
  due_day: number;
  frequency: string;
  payment_status: 'overdue' | 'due_today' | 'upcoming';
  category_name: string;
  category_color: string;
  is_active: boolean;
  auto_pay: boolean;
}

export interface InstallmentData {
  installment_id: string;
  item_name: string;
  total_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  total_installments: number;
  paid_installments: number;
  completion_percentage: number;
  payment_status: 'overdue' | 'due_today' | 'upcoming';
  due_date: string;
  remaining_installments: number;
  interest_rate: number;
}

export interface BudgetVsActualData {
  budget_id: string;
  budget_name: string;
  category_id: string;
  category_name: string;
  category_color: string;
  allocated_amount: number;
  actual_spent: number;
  usage_percentage: number;
}

export interface HighValueTransactionData {
  transaction_id: string;
  amount: number;
  description: string;
  type: string;
  date: string;
  category_name: string;
  category_color: string;
  credit_card_name?: string;
  bank_account_name?: string;
}

export interface AnalyticsData {
  monthlyTransactions: MonthlyTransactionData[];
  categorySpending: CategorySpendingData[];
  creditCardUsage: CreditCardUsageData[];
  bankAccounts: BankAccountData[];
  recurringPayments: RecurringPaymentData[];
  installments: InstallmentData[];
  budgetVsActual: BudgetVsActualData[];
  highValueTransactions: HighValueTransactionData[];
  error: string | null;
}

// Server-side data fetching function for analytics
export async function fetchAnalyticsData(userId: string, filters: AnalyticsFilters): Promise<AnalyticsData> {
  try {
    const supabase = await createClient();
    
    // Fetch cached and non-cached analytics data in parallel for better performance
    const [
      monthlyTransactions,
      categorySpending,
      creditCardUsage,
      bankAccounts,
      recurringPayments,
      installments,
      budgetVsActual,
      highValueTransactions
    ] = await Promise.all([
      getCachedMonthlyTransactions(userId, supabase),
      getCachedCategorySpending(userId, supabase),
      getCreditCardUsage(supabase, userId, filters),
      getBankAccounts(supabase, userId, filters),
      getRecurringPayments(supabase, userId, filters),
      getInstallments(supabase, userId, filters),
      getBudgetVsActual(supabase, userId, filters),
      getHighValueTransactions(supabase, userId, filters)
    ]);

    return {
      monthlyTransactions,
      categorySpending,
      creditCardUsage,
      bankAccounts,
      recurringPayments,
      installments,
      budgetVsActual,
      highValueTransactions,
      error: null
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      monthlyTransactions: [],
      categorySpending: [],
      creditCardUsage: [],
      bankAccounts: [],
      recurringPayments: [],
      installments: [],
      budgetVsActual: [],
      highValueTransactions: [],
      error: error instanceof Error ? error.message : 'Failed to fetch analytics data'
    };
  }
}

// Individual data fetching functions
async function getMonthlyTransactions(supabase: any, userId: string, filters: AnalyticsFilters): Promise<MonthlyTransactionData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_monthly_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching monthly transactions:', error);
      return [];
    }

    // Group by month and aggregate by type
    const monthlyData = (data || []).reduce((acc: Record<string, MonthlyTransactionData>, row: any) => {
      const monthKey = new Date(row.month).toISOString().substring(0, 7); // YYYY-MM format
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          transfers: 0,
          transaction_count: 0
        };
      }

      acc[monthKey].transaction_count += row.transaction_count;
      
      switch (row.type) {
        case 'income':
          acc[monthKey].income += row.total_amount;
          break;
        case 'expense':
          acc[monthKey].expenses += row.total_amount;
          break;
        case 'transfer':
          acc[monthKey].transfers += row.total_amount;
          break;
      }

      return acc;
    }, {});

    return Object.values(monthlyData);
  } catch (error) {
    console.error('Error in getMonthlyTransactions:', error);
    return [];
  }
}

async function getCategorySpending(supabase: any, userId: string, filters: AnalyticsFilters): Promise<CategorySpendingData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_category_spending')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .order('total_amount', { ascending: false });

    if (error) {
      console.error('Error fetching category spending:', error);
      return [];
    }

    // Calculate total for percentage calculation
    const totalAmount = (data || []).reduce((sum: number, row: any) => sum + row.total_amount, 0);

    return (data || []).map((row: any) => ({
      category_id: row.category_id,
      category_name: row.category_name,
      category_color: row.category_color,
      total_amount: row.total_amount,
      transaction_count: row.transaction_count,
      percentage: totalAmount > 0 ? (row.total_amount / totalAmount) * 100 : 0
    }));
  } catch (error) {
    console.error('Error in getCategorySpending:', error);
    return [];
  }
}

async function getCreditCardUsage(supabase: any, userId: string, filters: AnalyticsFilters): Promise<CreditCardUsageData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_credit_card_usage')
      .select('*')
      .eq('user_id', userId)
      .order('usage_percentage', { ascending: false });

    if (error) {
      console.error('Error fetching credit card usage:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      card_id: row.card_id,
      card_name: row.card_name,
      card_type: row.card_type,
      last_four_digits: row.last_four_digits,
      credit_limit: row.credit_limit,
      current_balance: row.current_balance,
      available_credit: row.available_credit,
      usage_percentage: row.usage_percentage,
      monthly_expenses: row.monthly_expenses
    }));
  } catch (error) {
    console.error('Error in getCreditCardUsage:', error);
    return [];
  }
}

async function getBankAccounts(supabase: any, userId: string, filters: AnalyticsFilters): Promise<BankAccountData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('current_balance', { ascending: false });

    if (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      account_id: row.account_id,
      account_name: row.account_name,
      account_type: row.account_type,
      account_number_masked: row.account_number_masked,
      current_balance: row.current_balance,
      available_balance: row.available_balance,
      monthly_income: row.monthly_income,
      monthly_expenses: row.monthly_expenses
    }));
  } catch (error) {
    console.error('Error in getBankAccounts:', error);
    return [];
  }
}

async function getRecurringPayments(supabase: any, userId: string, filters: AnalyticsFilters): Promise<RecurringPaymentData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_recurring_payments')
      .select('*')
      .eq('user_id', userId)
      .order('due_day', { ascending: true });

    if (error) {
      console.error('Error fetching recurring payments:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      payment_id: row.payment_id,
      payment_type: row.payment_type,
      amount: row.amount,
      due_day: row.due_day,
      frequency: row.frequency,
      payment_status: row.payment_status,
      category_name: row.category_name,
      category_color: row.category_color
    }));
  } catch (error) {
    console.error('Error in getRecurringPayments:', error);
    return [];
  }
}

async function getInstallments(supabase: any, userId: string, filters: AnalyticsFilters): Promise<InstallmentData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_installments')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching installments:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      installment_id: row.installment_id,
      item_name: row.item_name,
      total_amount: row.total_amount,
      remaining_amount: row.remaining_amount,
      monthly_payment: row.monthly_payment,
      total_installments: row.total_installments,
      paid_installments: row.paid_installments,
      completion_percentage: row.completion_percentage,
      payment_status: row.payment_status
    }));
  } catch (error) {
    console.error('Error in getInstallments:', error);
    return [];
  }
}

async function getBudgetVsActual(supabase: any, userId: string, filters: AnalyticsFilters): Promise<BudgetVsActualData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_budget_vs_actual')
      .select('*')
      .eq('user_id', userId)
      .order('usage_percentage', { ascending: false });

    if (error) {
      console.error('Error fetching budget vs actual:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      budget_id: row.budget_id,
      budget_name: row.budget_name,
      category_id: row.category_id,
      category_name: row.category_name,
      category_color: row.category_color,
      allocated_amount: row.allocated_amount,
      actual_spent: row.actual_spent,
      usage_percentage: row.usage_percentage
    }));
  } catch (error) {
    console.error('Error in getBudgetVsActual:', error);
    return [];
  }
}

async function getHighValueTransactions(supabase: any, userId: string, filters: AnalyticsFilters): Promise<HighValueTransactionData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_high_value_transactions')
      .select('*')
      .eq('user_id', userId)
      .limit(10);

    if (error) {
      console.error('Error fetching high value transactions:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      transaction_id: row.transaction_id,
      amount: row.amount,
      description: row.description,
      type: row.type,
      date: row.date,
      category_name: row.category_name,
      category_color: row.category_color,
      credit_card_name: row.credit_card_name,
      bank_account_name: row.bank_account_name
    }));
  } catch (error) {
    console.error('Error in getHighValueTransactions:', error);
    return [];
  }
}
