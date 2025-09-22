/**
 * Enhanced Income Service with Better Error Handling
 * Provides server-side data fetching with structured error handling
 */

import { createClient } from '@/lib/supabase/server';
import { ErrorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

export interface IncomeDataResult {
  income: any[];
  categories: any[];
  paymentMethods: any[];
  errors: {
    income?: AppError;
    categories?: AppError;
    paymentMethods?: AppError;
    general?: AppError;
  };
  hasErrors: boolean;
}

/**
 * Fetch income data with enhanced error handling
 */
export async function fetchIncomeDataWithErrorHandling(userId: string): Promise<IncomeDataResult> {
  try {
    const supabase = await createClient();
    
    // Use Promise.allSettled to handle individual failures gracefully
    const [incomeResult, categoriesResult, paymentMethodsResult] = await Promise.allSettled([
      ErrorHandler.withRetry(async () => 
        await supabase
          .from('income_management_view')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
      ),
      ErrorHandler.withRetry(async () => 
        await supabase
          .from('categories')
          .select('*')
          .eq('user_id', userId)
          .order('name')
      ),
      ErrorHandler.withRetry(async () => 
        await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('sort_order')
      )
    ]);

    const result: IncomeDataResult = {
      income: [],
      categories: [],
      paymentMethods: [],
      errors: {},
      hasErrors: false
    };

    // Process income results
    if (incomeResult.status === 'fulfilled') {
      const { data, error } = incomeResult.value;
      if (error) {
        result.errors.income = ErrorHandler.handleError(error, { userId, operation: 'fetchIncome' });
        result.hasErrors = true;
      } else {
        result.income = data || [];
      }
    } else {
      result.errors.income = incomeResult.reason;
      result.hasErrors = true;
    }

    // Process categories results
    if (categoriesResult.status === 'fulfilled') {
      const { data, error } = categoriesResult.value;
      if (error) {
        result.errors.categories = ErrorHandler.handleError(error, { userId, operation: 'fetchCategories' });
        result.hasErrors = true;
      } else {
        result.categories = data || [];
      }
    } else {
      result.errors.categories = categoriesResult.reason;
      result.hasErrors = true;
    }

    // Process payment methods results
    if (paymentMethodsResult.status === 'fulfilled') {
      const { data, error } = paymentMethodsResult.value;
      if (error) {
        result.errors.paymentMethods = ErrorHandler.handleError(error, { userId, operation: 'fetchPaymentMethods' });
        result.hasErrors = true;
      } else {
        result.paymentMethods = data || [];
      }
    } else {
      result.errors.paymentMethods = paymentMethodsResult.reason;
      result.hasErrors = true;
    }

    return result;
  } catch (error) {
    // Handle unexpected errors
    const appError = ErrorHandler.handleError(error, { userId, operation: 'fetchIncomeData' });
    
    return {
      income: [],
      categories: [],
      paymentMethods: [],
      errors: {
        general: appError
      },
      hasErrors: true
    };
  }
}

/**
 * Create default categories for income if they don't exist
 */
export async function ensureIncomeCategories(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Check if user has any income categories
    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error('Error fetching categories:', fetchError);
      return false;
    }
    
    const hasIncomeCategories = existingCategories?.some(cat => 
      ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Side Hustle', 'Bonus', 'Refund', 'Other Income'].includes(cat.name)
    );
    
    if (!hasIncomeCategories) {
      // Create default income categories
      const defaultIncomeCategories = [
        { name: 'Salary', description: 'Regular employment income', color: '#2ed573', icon: 'briefcase' },
        { name: 'Freelance', description: 'Freelance and contract work', color: '#ffa502', icon: 'user' },
        { name: 'Business', description: 'Business income and profits', color: '#ff6348', icon: 'building' },
        { name: 'Investment', description: 'Dividends, capital gains', color: '#3742fa', icon: 'trending-up' },
        { name: 'Rental', description: 'Rental income from properties', color: '#ff9f43', icon: 'home' },
        { name: 'Side Hustle', description: 'Part-time or side business income', color: '#5f27cd', icon: 'zap' },
        { name: 'Bonus', description: 'Performance bonuses and incentives', color: '#00d2d3', icon: 'gift' },
        { name: 'Refund', description: 'Returns and refunds', color: '#ff6b6b', icon: 'rotate-ccw' },
        { name: 'Other Income', description: 'Other sources of income', color: '#2f3542', icon: 'dollar-sign' }
      ];

      const categoriesToInsert = defaultIncomeCategories.map(cat => ({
        user_id: userId,
        name: cat.name,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        is_default: true
      }));

      const { error: insertError } = await supabase
        .from('categories')
        .insert(categoriesToInsert);
      
      if (insertError) {
        console.error('Error creating income categories:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring income categories:', error);
    return false;
  }
}

/**
 * Get income summary with error handling
 */
export async function getIncomeSummaryWithErrorHandling(
  userId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  summary: any;
  error?: AppError;
}> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('income_management_view')
      .select('*')
      .eq('user_id', userId);
    
    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('date', dateTo);
    }
    
    const { data, error } = await query;
    
    if (error) {
      const appError = ErrorHandler.handleError(error, { 
        userId, 
        dateFrom, 
        dateTo, 
        operation: 'getIncomeSummary' 
      });
      
      return { 
        summary: {
          totalIncome: 0,
          totalTransactions: 0,
          averageIncome: 0,
          byType: {},
          byCategory: {}
        },
        error: appError
      };
    }
    
    // Calculate summary
    const totalIncome = data?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
    const totalTransactions = data?.length || 0;
    const averageIncome = totalTransactions > 0 ? totalIncome / totalTransactions : 0;
    
    // Group by type
    const byType: Record<string, number> = {};
    data?.forEach((item: any) => {
      const type = item.income_type || 'general';
      byType[type] = (byType[type] || 0) + (item.amount || 0);
    });
    
    // Group by category
    const byCategory: Record<string, number> = {};
    data?.forEach((item: any) => {
      const category = item.category_name || 'Uncategorized';
      byCategory[category] = (byCategory[category] || 0) + (item.amount || 0);
    });
    
    return { 
      summary: {
        totalIncome,
        totalTransactions,
        averageIncome,
        byType,
        byCategory
      }
    };
  } catch (error) {
    const appError = ErrorHandler.handleError(error, { 
      userId, 
      dateFrom, 
      dateTo, 
      operation: 'getIncomeSummary' 
    });
    
    return { 
      summary: {
        totalIncome: 0,
        totalTransactions: 0,
        averageIncome: 0,
        byType: {},
        byCategory: {}
      },
      error: appError
    };
  }
}
