import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from 'next/cache';

// =============================================
// CACHED DATA FETCHING FUNCTIONS
// =============================================
// Optimized data fetching with Next.js caching for better performance

// Cache configuration
const CACHE_TAGS = {
  DASHBOARD: 'dashboard-data',
  ANALYTICS: 'analytics-data',
  USER_PROFILE: 'user-profile',
  TRANSACTIONS: 'transactions',
  CREDIT_CARDS: 'credit-cards',
  BANK_ACCOUNTS: 'bank-accounts',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
  INSTALLMENTS: 'installments',
  RECURRING_PAYMENTS: 'recurring-payments'
} as const;

// Cache duration (in seconds)
const CACHE_DURATION = {
  SHORT: 60,    // 1 minute for frequently changing data
  MEDIUM: 300,  // 5 minutes for moderately changing data
  LONG: 1800,   // 30 minutes for relatively static data
  VERY_LONG: 3600 // 1 hour for static data
} as const;

// =============================================
// DASHBOARD DATA CACHING
// =============================================

// Cached dashboard summary
export const getCachedDashboardSummary = unstable_cache(
  async (userId: string, supabaseClient: any) => {
    const { data, error } = await supabaseClient
      .from('user_dashboard_summary')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching dashboard summary:', error);
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
        netWorth: 0,
        monthlyTrend: 0
      };
    }

    if (!data) {
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
        netWorth: 0,
        monthlyTrend: 0
      };
    }

    const totalBudget = 3000; // Default budget
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
      netWorth: (data.total_income || 0) - (data.total_expenses || 0),
      monthlyTrend: 0 // Can be calculated from monthly data
    };
  },
  ['dashboard-summary'],
  {
    tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.USER_PROFILE],
    revalidate: CACHE_DURATION.SHORT
  }
);

// Cached recent transactions
export const getCachedRecentTransactions = unstable_cache(
  async (userId: string, limit: number, supabaseClient: any) => {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select(`
        id,
        amount,
        description,
        type,
        date,
        notes,
        categories (name, color),
        credit_cards (card_name, last_four_digits),
        bank_accounts (account_name, account_type)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }

    return (data || []).map((transaction: any) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      date: transaction.date,
      notes: transaction.notes,
      category_name: transaction.categories?.name || 'Uncategorized',
      category_color: transaction.categories?.color || '#6b7280',
      credit_card_name: transaction.credit_cards?.card_name,
      credit_card_last_four: transaction.credit_cards?.last_four_digits,
      bank_account_name: transaction.bank_accounts?.account_name,
      bank_account_type: transaction.bank_accounts?.account_type
    }));
  },
  ['recent-transactions'],
  {
    tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.TRANSACTIONS],
    revalidate: CACHE_DURATION.SHORT
  }
);

// Cached credit cards
export const getCachedCreditCards = unstable_cache(
  async (userId: string, limit: number, supabaseClient: any) => {
    const { data, error } = await supabaseClient
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('current_balance', { ascending: false })
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
      usage_percentage: Math.round((card.current_balance / card.credit_limit) * 100),
      due_date: card.due_date
    }));
  },
  ['credit-cards'],
  {
    tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.CREDIT_CARDS],
    revalidate: CACHE_DURATION.MEDIUM
  }
);

// Cached bank accounts
export const getCachedBankAccounts = unstable_cache(
  async (userId: string, limit: number, supabaseClient: any) => {
    const { data, error } = await supabaseClient
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('current_balance', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }

    return (data || []).map((account: any) => ({
      id: account.id,
      account_name: account.account_name,
      account_type: account.account_type,
      account_number_masked: account.account_number_masked,
      current_balance: account.current_balance,
      available_balance: account.available_balance
    }));
  },
  ['bank-accounts'],
  {
    tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.BANK_ACCOUNTS],
    revalidate: CACHE_DURATION.MEDIUM
  }
);

// Cached expense categories
export const getCachedExpenseCategories = unstable_cache(
  async (userId: string, supabaseClient: any) => {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('Error fetching expense categories:', error);
      return [];
    }

    return (data || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      description: category.description
    }));
  },
  ['expense-categories'],
  {
    tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.CATEGORIES],
    revalidate: CACHE_DURATION.LONG
  }
);

// =============================================
// ANALYTICS DATA CACHING
// =============================================

// Cached monthly transactions for analytics
export const getCachedMonthlyTransactions = unstable_cache(
  async (userId: string, supabaseClient: any) => {
    const { data, error } = await supabaseClient
      .from('analytics_monthly_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching monthly transactions:', error);
      return [];
    }

    // Group by month and aggregate by type
    const monthlyData = (data || []).reduce((acc: Record<string, any>, row: any) => {
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

    return Object.values(monthlyData) as any[];
  },
  ['monthly-transactions'],
  {
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.TRANSACTIONS],
    revalidate: CACHE_DURATION.MEDIUM
  }
);

// Cached category spending for analytics
export const getCachedCategorySpending = unstable_cache(
  async (userId: string, supabaseClient: any) => {
    const { data, error } = await supabaseClient
      .from('analytics_category_spending')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .order('total_amount', { ascending: false });

    if (error) {
      console.error('Error fetching category spending:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      category_id: row.category_id,
      category_name: row.category_name,
      category_color: row.category_color,
      total_amount: row.total_amount,
      transaction_count: row.transaction_count,
      avg_amount: row.avg_amount
    }));
  },
  ['category-spending'],
  {
    tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.CATEGORIES],
    revalidate: CACHE_DURATION.MEDIUM
  }
);

// =============================================
// CACHE INVALIDATION UTILITIES
// =============================================

// Function to invalidate user-specific cache
export async function invalidateUserCache(userId: string) {
  // This would be called when user data changes
  // For now, we rely on the revalidate timeouts
  console.log(`Cache invalidation requested for user: ${userId}`);
}

// Function to invalidate specific cache tags
export async function invalidateCacheByTag(tag: string) {
  // This would be called when specific data changes
  console.log(`Cache invalidation requested for tag: ${tag}`);
}
