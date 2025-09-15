import { createClient } from "@/lib/supabase/server";

// =============================================
// EXPENSE MANAGEMENT SERVICE
// =============================================
// Comprehensive service for managing all types of expenses

// Types for expense management
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
  credit_card_name?: string;
  credit_card_last_four?: string;
  bank_account_id?: string;
  bank_account_name?: string;
  bank_account_type?: string;
  
  // Computed fields
  expense_type: 'Expense' | 'Credit Card Payment' | 'Installment Payment' | 'Recurring Payment';
  expense_icon: string;
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
  credit_card_id?: string;
  bank_account_id?: string;
  status?: 'draft' | 'pending' | 'completed' | 'failed';
  notes?: string;
  installment_number?: number;
  installment_total?: number;
  receipt_url?: string;
}

export interface CreateCreditCardPaymentData {
  credit_card_id: string;
  amount: number;
  date: string;
  payment_method_id?: string;
  notes?: string;
  receipt_url?: string;
}

export interface CreateInstallmentPaymentData {
  installment_id: string;
  amount: number;
  date: string;
  payment_method_id?: string;
  notes?: string;
  receipt_url?: string;
}

// =============================================
// EXPENSE CRUD OPERATIONS
// =============================================

export class ExpenseService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  // Get all expenses with filtering
  async getExpenses(userId: string, filters: ExpenseFilters = {}): Promise<ExpenseTransaction[]> {
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
  async getExpenseById(expenseId: string): Promise<ExpenseTransaction | null> {
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
  async createExpense(userId: string, expenseData: CreateExpenseData): Promise<ExpenseTransaction | null> {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .insert({
          user_id: userId,
          date: expenseData.date,
          description: expenseData.description,
          amount: expenseData.amount,
          type: 'expense',
          category_id: expenseData.category_id,
          payment_method_id: expenseData.payment_method_id,
          credit_card_id: expenseData.credit_card_id,
          bank_account_id: expenseData.bank_account_id,
          status: expenseData.status || 'completed',
          notes: expenseData.notes,
          installment_number: expenseData.installment_number,
          installment_total: expenseData.installment_total,
          receipt_url: expenseData.receipt_url
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        return null;
      }

      // Return the expense with computed fields
      return await this.getExpenseById(data.id);
    } catch (error) {
      console.error('Error in createExpense:', error);
      return null;
    }
  }

  // Update expense
  async updateExpense(expenseId: string, updates: Partial<CreateExpenseData>): Promise<ExpenseTransaction | null> {
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

  // =============================================
  // PAYMENT METHODS MANAGEMENT
  // =============================================

  // Get user's payment methods
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
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
  async createPaymentMethod(userId: string, methodData: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod | null> {
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
  async updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
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

  // =============================================
  // CREDIT CARD PAYMENT OPERATIONS
  // =============================================

  // Create credit card payment
  async createCreditCardPayment(userId: string, paymentData: CreateCreditCardPaymentData): Promise<ExpenseTransaction | null> {
    try {
      // Get credit card info for description
      const { data: creditCard } = await this.supabase
        .from('credit_cards')
        .select('card_name, last_four_digits')
        .eq('id', paymentData.credit_card_id)
        .single();

      const description = `Payment to ${creditCard?.card_name || 'Credit Card'} ****${creditCard?.last_four_digits || '****'}`;

      const expenseData: CreateExpenseData = {
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

  // =============================================
  // INSTALLMENT PAYMENT OPERATIONS
  // =============================================

  // Create installment payment
  async createInstallmentPayment(userId: string, paymentData: CreateInstallmentPaymentData): Promise<ExpenseTransaction | null> {
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

      const expenseData: CreateExpenseData = {
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

  // =============================================
  // NOTIFICATION MANAGEMENT
  // =============================================

  // Get user's payment notifications
  async getPaymentNotifications(userId: string): Promise<PaymentNotification[]> {
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
  // ANALYTICS AND SUMMARY
  // =============================================

  // Get expense summary for dashboard
  async getExpenseSummary(userId: string, dateFrom?: string, dateTo?: string): Promise<{
    totalExpenses: number;
    totalCreditCardPayments: number;
    totalInstallmentPayments: number;
    totalRecurringPayments: number;
    expenseCount: number;
    averageExpense: number;
  }> {
    try {
      let query = this.supabase
        .from('expense_management_view')
        .select('amount, expense_type')
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
        console.error('Error fetching expense summary:', error);
        return {
          totalExpenses: 0,
          totalCreditCardPayments: 0,
          totalInstallmentPayments: 0,
          totalRecurringPayments: 0,
          expenseCount: 0,
          averageExpense: 0
        };
      }

      const expenses = data || [];
      const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const totalCreditCardPayments = expenses
        .filter((e: any) => e.expense_type === 'Credit Card Payment')
        .reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const totalInstallmentPayments = expenses
        .filter((e: any) => e.expense_type === 'Installment Payment')
        .reduce((sum: number, expense: any) => sum + expense.amount, 0);
      const totalRecurringPayments = expenses
        .filter((e: any) => e.expense_type === 'Recurring Payment')
        .reduce((sum: number, expense: any) => sum + expense.amount, 0);

      return {
        totalExpenses,
        totalCreditCardPayments,
        totalInstallmentPayments,
        totalRecurringPayments,
        expenseCount: expenses.length,
        averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0
      };
    } catch (error) {
      console.error('Error in getExpenseSummary:', error);
      return {
        totalExpenses: 0,
        totalCreditCardPayments: 0,
        totalInstallmentPayments: 0,
        totalRecurringPayments: 0,
        expenseCount: 0,
        averageExpense: 0
      };
    }
  }
}

// =============================================
// SERVER-SIDE EXPENSE SERVICE FACTORY
// =============================================

export async function createExpenseService() {
  const supabase = await createClient();
  return new ExpenseService(supabase);
}
