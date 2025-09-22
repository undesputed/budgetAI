import { createClient } from "@/lib/supabase/client";

// =============================================
// CLIENT-SIDE EXPENSE SERVICE
// =============================================
// This version uses the client-side Supabase client for use in client components

// Define types locally to avoid circular dependencies
export interface ExpenseTransaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  type: 'expense';
  status: 'draft' | 'pending' | 'completed' | 'failed';
  notes?: string;
  installment_number?: number;
  installment_total?: number;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  category_id?: string;
  category_name?: string;
  category_color?: string;
  payment_method_id?: string;
  payment_method_name?: string;
  payment_method_type?: string;
  credit_card_id?: string;
  bank_account_id?: string;
  
  // Computed fields
  expense_type?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank_account' | 'credit_card' | 'e_wallet' | 'other';
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentNotification {
  id: string;
  user_id: string;
  type: 'recurring_due' | 'installment_due' | 'credit_card_due';
  reference_id: string;
  title: string;
  message: string;
  due_date: string;
  amount: number;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilters {
  type?: 'all' | 'expense' | 'credit_card_payment' | 'installment_payment' | 'recurring_payment';
  category?: string;
  payment_method?: string;
  status?: 'all' | 'draft' | 'pending' | 'completed' | 'failed';
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
}

export interface CreateExpenseData {
  date: string;
  description: string;
  amount: number;
  category_id?: string;
  payment_method_id?: string;
  status?: 'draft' | 'pending' | 'completed' | 'failed';
  notes?: string;
  installment_number?: number;
  installment_total?: number;
  receipt_url?: string;
}

export interface CreateCreditCardPaymentData {
  date: string;
  description: string;
  amount: number;
  credit_card_id: string;
  status?: 'draft' | 'pending' | 'completed' | 'failed';
  notes?: string;
}

export interface CreateInstallmentPaymentData {
  date: string;
  description: string;
  amount: number;
  installment_id: string;
  installment_number: number;
  status?: 'draft' | 'pending' | 'completed' | 'failed';
  notes?: string;
}

// Income-specific interfaces
export interface IncomeTransaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income';
  status: 'draft' | 'pending' | 'completed' | 'failed';
  notes?: string;
  income_source?: string;
  income_type: 'general' | 'recurring' | 'refund' | 'transfer';
  created_at: string;
  updated_at: string;
  
  // Related data
  category_id?: string;
  category_name?: string;
  category_color?: string;
  payment_method_id?: string;
  payment_method_name?: string;
  payment_method_type?: string;
  bank_account_id?: string;
  bank_account_name?: string;
  
  // Computed fields
  income_type_label?: string;
  income_icon?: string;
}

export interface CreateIncomeData {
  date: string;
  description: string;
  amount: number;
  category_id?: string;
  payment_method_id?: string;
  bank_account_id?: string;
  income_source?: string;
  income_type?: 'general' | 'recurring' | 'refund' | 'transfer';
  status?: 'draft' | 'pending' | 'completed' | 'failed';
  notes?: string;
}

export interface IncomeFilters {
  type?: 'all' | 'general' | 'recurring' | 'refund' | 'transfer';
  category?: string;
  payment_method?: string;
  status?: 'all' | 'draft' | 'pending' | 'completed' | 'failed';
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  income_source?: string;
}

// =============================================
// CLIENT-SIDE EXPENSE SERVICE CLASS
// =============================================

export class ExpenseServiceClient {
  private supabase: any;

  constructor() {
    this.supabase = createClient();
  }

  // Get all expenses with filtering
  async getExpenses(userId: string, filters: any = {}): Promise<any[]> {
    try {
      let query = this.supabase
        .from('expense_management_view')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        switch (filters.type) {
          case 'expense':
            query = query.eq('expense_type', 'Expense');
            break;
          case 'credit_card_payment':
            query = query.eq('expense_type', 'Credit Card Payment');
            break;
          case 'installment_payment':
            query = query.eq('expense_type', 'Installment Payment');
            break;
          case 'recurring_payment':
            query = query.eq('expense_type', 'Recurring Payment');
            break;
        }
      }

      if (filters.category) {
        query = query.eq('category_name', filters.category);
      }

      if (filters.payment_method) {
        query = query.eq('payment_method_name', filters.payment_method);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.date_from) {
        query = query.gte('date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('date', filters.date_to);
      }

      if (filters.amount_min) {
        query = query.gte('amount', filters.amount_min);
      }

      if (filters.amount_max) {
        query = query.lte('amount', filters.amount_max);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getExpenses:', error);
      return [];
    }
  }

  // Get single expense by ID
  async getExpenseById(expenseId: string): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('expense_management_view')
        .select('*')
        .eq('id', expenseId)
        .single();

      if (error) {
        console.error('Error fetching expense:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getExpenseById:', error);
      return null;
    }
  }

  // Create new expense
  async createExpense(userId: string, expenseData: any): Promise<any | null> {
    try {
      // Validate required fields
      if (!expenseData.description || !expenseData.description.trim()) {
        console.error('Description is required');
        return null;
      }
      
      if (!expenseData.amount || expenseData.amount <= 0) {
        console.error('Valid amount is required');
        return null;
      }
      
      if (!expenseData.date) {
        console.error('Date is required');
        return null;
      }

      // Prepare data with proper null handling for empty strings
      const insertData = {
        user_id: userId,
        date: expenseData.date,
        description: expenseData.description.trim(),
        amount: parseFloat(expenseData.amount),
        type: 'expense',
        category_id: expenseData.category_id || null,
        payment_method_id: expenseData.payment_method_id || null,
        credit_card_id: expenseData.credit_card_id || null,
        bank_account_id: expenseData.bank_account_id || null,
        status: expenseData.status || 'completed',
        notes: expenseData.notes || null,
        installment_number: expenseData.installment_number || null,
        installment_total: expenseData.installment_total || null,
        receipt_url: expenseData.receipt_url || null
      };

      console.log('Creating expense with data:', insertData);

      const { data, error } = await this.supabase
        .from('transactions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Insert data that failed:', JSON.stringify(insertData, null, 2));
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        return null;
      }

      console.log('Expense created successfully:', data);
      
      // Return the created expense data directly
      return {
        id: data.id,
        date: data.date,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category_id: data.category_id,
        payment_method_id: data.payment_method_id,
        credit_card_id: data.credit_card_id,
        bank_account_id: data.bank_account_id,
        status: data.status,
        notes: data.notes,
        installment_number: data.installment_number,
        installment_total: data.installment_total,
        receipt_url: data.receipt_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Add computed fields for compatibility
        expense_type: 'Expense',
        category_name: null,
        payment_method_name: null
      };
    } catch (error) {
      console.error('Error in createExpense:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error stack:', (error as Error)?.stack);
      return null;
    }
  }

  // Update expense
  async updateExpense(expenseId: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        return null;
      }

      return await this.getExpenseById(expenseId);
    } catch (error) {
      console.error('Error in updateExpense:', error);
      return null;
    }
  }

  // Delete expense
  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting expense:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      return false;
    }
  }

  // Get user's payment methods
  async getPaymentMethods(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      return [];
    }
  }

  // Create payment method
  async createPaymentMethod(userId: string, methodData: any): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          ...methodData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment method:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createPaymentMethod:', error);
      return null;
    }
  }

  // Update payment method
  async updatePaymentMethod(methodId: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', methodId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment method:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePaymentMethod:', error);
      return null;
    }
  }

  // Delete payment method
  async deletePaymentMethod(methodId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) {
        console.error('Error deleting payment method:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePaymentMethod:', error);
      return false;
    }
  }

  // Get credit cards for user
  async getCreditCards(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('card_name');

      if (error) {
        console.error('Error fetching credit cards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCreditCards:', error);
      return [];
    }
  }

  // Get bank accounts for user
  async getBankAccounts(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('account_name');

      if (error) {
        console.error('Error fetching bank accounts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBankAccounts:', error);
      return [];
    }
  }

  // Get installments for user
  async getInstallments(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('installments')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('item_name');

      if (error) {
        console.error('Error fetching installments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInstallments:', error);
      return [];
    }
  }

  // Get categories for user
  async getCategories(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  // Create default categories for user if they don't exist
  async createDefaultCategories(userId: string): Promise<boolean> {
    try {
      // Check if user already has categories
      const existingCategories = await this.getCategories(userId);
      if (existingCategories.length > 0) {
        return true; // Categories already exist
      }

      // Create default expense categories
      const defaultCategories = [
        { name: 'Food & Dining', description: 'Restaurants, groceries, and food delivery', color: '#ff6b6b', icon: 'utensils' },
        { name: 'Transportation', description: 'Gas, public transport, rideshare', color: '#4ecdc4', icon: 'car' },
        { name: 'Housing', description: 'Rent, mortgage, utilities', color: '#45b7d1', icon: 'home' },
        { name: 'Entertainment', description: 'Movies, games, subscriptions', color: '#96ceb4', icon: 'tv' },
        { name: 'Healthcare', description: 'Medical expenses, insurance', color: '#feca57', icon: 'heart' },
        { name: 'Shopping', description: 'Clothing, personal items', color: '#ff9ff3', icon: 'shopping-bag' },
        { name: 'Education', description: 'Books, courses, training', color: '#54a0ff', icon: 'book' },
        { name: 'Travel', description: 'Vacations, business trips', color: '#5f27cd', icon: 'plane' },
        { name: 'Other', description: 'Miscellaneous expenses', color: '#a55eea', icon: 'more-horizontal' }
      ];

      const categoriesToInsert = defaultCategories.map(cat => ({
        user_id: userId,
        name: cat.name,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        is_default: true
      }));

      const { error } = await this.supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (error) {
        console.error('Error creating default categories:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createDefaultCategories:', error);
      return false;
    }
  }

  // Create credit card payment
  async createCreditCardPayment(userId: string, paymentData: any): Promise<any | null> {
    try {
      // Get credit card info for description
      const { data: creditCard } = await this.supabase
        .from('credit_cards')
        .select('card_name, last_four_digits')
        .eq('id', paymentData.credit_card_id)
        .single();

      const description = `Payment to ${creditCard?.card_name || 'Credit Card'} ****${creditCard?.last_four_digits || '****'}`;

      const expenseData = {
        date: paymentData.date,
        description,
        amount: paymentData.amount,
        credit_card_id: paymentData.credit_card_id,
        payment_method_id: paymentData.payment_method_id,
        status: 'completed',
        notes: paymentData.notes,
        receipt_url: paymentData.receipt_url
      };

      const expense = await this.createExpense(userId, expenseData);

      if (expense) {
        // Update credit card balance using the database function
        const { error: balanceError } = await this.supabase
          .rpc('update_credit_card_balance_after_payment', {
            p_credit_card_id: paymentData.credit_card_id,
            p_payment_amount: paymentData.amount
          });

        if (balanceError) {
          console.error('Error updating credit card balance:', balanceError);
        }
      }

      return expense;
    } catch (error) {
      console.error('Error in createCreditCardPayment:', error);
      return null;
    }
  }

  // Create installment payment
  async createInstallmentPayment(userId: string, paymentData: any): Promise<any | null> {
    try {
      // Get installment info
      const { data: installment } = await this.supabase
        .from('installments')
        .select('*')
        .eq('id', paymentData.installment_id)
        .single();

      if (!installment) {
        console.error('Installment not found');
        return null;
      }

      const nextPaymentNumber = installment.paid_installments + 1;
      const description = `${installment.item_name} Installment - Month ${nextPaymentNumber}/${installment.total_installments}`;

      const expenseData = {
        date: paymentData.date,
        description,
        amount: paymentData.amount,
        payment_method_id: paymentData.payment_method_id,
        status: 'completed',
        notes: paymentData.notes,
        receipt_url: paymentData.receipt_url,
        installment_number: nextPaymentNumber,
        installment_total: installment.total_installments
      };

      const expense = await this.createExpense(userId, expenseData);

      if (expense) {
        // Update installment progress using the database function
        const { error: progressError } = await this.supabase
          .rpc('update_installment_progress_after_payment', {
            p_installment_id: paymentData.installment_id,
            p_payment_amount: paymentData.amount
          });

        if (progressError) {
          console.error('Error updating installment progress:', progressError);
        }
      }

      return expense;
    } catch (error) {
      console.error('Error in createInstallmentPayment:', error);
      return null;
    }
  }

  // Get user's payment notifications
  async getPaymentNotifications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching payment notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPaymentNotifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('payment_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return false;
    }
  }

  // Dismiss notification
  async dismissNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('payment_notifications')
        .update({ is_dismissed: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error dismissing notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in dismissNotification:', error);
      return false;
    }
  }

  // =============================================
  // INCOME MANAGEMENT METHODS
  // =============================================

  // Get income transactions with filters
  async getIncomeTransactions(userId: string, filters: IncomeFilters = {}): Promise<IncomeTransaction[]> {
    try {
      let query = this.supabase
        .from('income_management_view')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        query = query.eq('income_type', filters.type);
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.payment_method) {
        query = query.eq('payment_method_id', filters.payment_method);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.date_from) {
        query = query.gte('date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('date', filters.date_to);
      }

      if (filters.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }

      if (filters.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }

      if (filters.income_source) {
        query = query.ilike('income_source', `%${filters.income_source}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching income transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getIncomeTransactions:', error);
      return [];
    }
  }

  // Create new income transaction
  async createIncome(userId: string, incomeData: CreateIncomeData): Promise<IncomeTransaction | null> {
    try {
      const transactionData = {
        user_id: userId,
        type: 'income' as const,
        date: incomeData.date,
        description: incomeData.description,
        amount: Math.abs(incomeData.amount), // Ensure positive amount for income
        category_id: incomeData.category_id || null,
        payment_method_id: incomeData.payment_method_id || null,
        bank_account_id: incomeData.bank_account_id || null,
        income_source: incomeData.income_source || null,
        income_type: incomeData.income_type || 'general',
        status: incomeData.status || 'completed',
        notes: incomeData.notes || null
      };

      const { data, error } = await this.supabase
        .from('transactions')
        .insert(transactionData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating income:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return null;
      }

      // Fetch the complete income transaction with related data
      const { data: completeIncome, error: fetchError } = await this.supabase
        .from('income_management_view')
        .select('*')
        .eq('id', data.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete income data:', fetchError);
        return data as IncomeTransaction;
      }

      return completeIncome;
    } catch (error) {
      console.error('Error in createIncome:', error);
      return null;
    }
  }

  // Update income transaction
  async updateIncome(userId: string, incomeId: string, incomeData: Partial<CreateIncomeData>): Promise<IncomeTransaction | null> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (incomeData.date) updateData.date = incomeData.date;
      if (incomeData.description) updateData.description = incomeData.description;
      if (incomeData.amount !== undefined) updateData.amount = Math.abs(incomeData.amount);
      if (incomeData.category_id !== undefined) updateData.category_id = incomeData.category_id;
      if (incomeData.payment_method_id !== undefined) updateData.payment_method_id = incomeData.payment_method_id;
      if (incomeData.bank_account_id !== undefined) updateData.bank_account_id = incomeData.bank_account_id;
      if (incomeData.income_source !== undefined) updateData.income_source = incomeData.income_source;
      if (incomeData.income_type !== undefined) updateData.income_type = incomeData.income_type;
      if (incomeData.status !== undefined) updateData.status = incomeData.status;
      if (incomeData.notes !== undefined) updateData.notes = incomeData.notes;

      const { data, error } = await this.supabase
        .from('transactions')
        .update(updateData)
        .eq('id', incomeId)
        .eq('user_id', userId)
        .eq('type', 'income')
        .select('*')
        .single();

      if (error) {
        console.error('Error updating income:', error);
        return null;
      }

      // Fetch the complete income transaction with related data
      const { data: completeIncome, error: fetchError } = await this.supabase
        .from('income_management_view')
        .select('*')
        .eq('id', incomeId)
        .single();

      if (fetchError) {
        console.error('Error fetching complete income data:', fetchError);
        return data as IncomeTransaction;
      }

      return completeIncome;
    } catch (error) {
      console.error('Error in updateIncome:', error);
      return null;
    }
  }

  // Delete income transaction
  async deleteIncome(userId: string, incomeId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('id', incomeId)
        .eq('user_id', userId)
        .eq('type', 'income');

      if (error) {
        console.error('Error deleting income:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteIncome:', error);
      return false;
    }
  }

  // Get income summary statistics
  async getIncomeSummary(userId: string, dateFrom?: string, dateTo?: string): Promise<{
    totalIncome: number;
    totalTransactions: number;
    averageIncome: number;
    byType: { [key: string]: number };
    byCategory: { [key: string]: number };
  }> {
    try {
      let query = this.supabase
        .from('income_management_view')
        .select('amount, income_type, category_name')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('date', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching income summary:', error);
        return {
          totalIncome: 0,
          totalTransactions: 0,
          averageIncome: 0,
          byType: {},
          byCategory: {}
        };
      }

      const totalIncome = data?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
      const totalTransactions = data?.length || 0;
      const averageIncome = totalTransactions > 0 ? totalIncome / totalTransactions : 0;

      // Group by type
      const byType: { [key: string]: number } = {};
      data?.forEach((item: any) => {
        const type = item.income_type || 'general';
        byType[type] = (byType[type] || 0) + (item.amount || 0);
      });

      // Group by category
      const byCategory: { [key: string]: number } = {};
      data?.forEach((item: any) => {
        const category = item.category_name || 'Uncategorized';
        byCategory[category] = (byCategory[category] || 0) + (item.amount || 0);
      });

      return {
        totalIncome,
        totalTransactions,
        averageIncome,
        byType,
        byCategory
      };
    } catch (error) {
      console.error('Error in getIncomeSummary:', error);
      return {
        totalIncome: 0,
        totalTransactions: 0,
        averageIncome: 0,
        byType: {},
        byCategory: {}
      };
    }
  }
}

// =============================================
// CLIENT-SIDE EXPENSE SERVICE FACTORY
// =============================================

export function createExpenseServiceClient() {
  return new ExpenseServiceClient();
}
