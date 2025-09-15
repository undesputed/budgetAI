import { createClient } from "@/lib/supabase/client";

// =============================================
// CLIENT-SIDE EXPENSE SERVICE
// =============================================
// This version uses the client-side Supabase client for use in client components

// Re-export types from the main service
export type {
  ExpenseTransaction,
  PaymentMethod,
  PaymentNotification,
  ExpenseFilters,
  CreateExpenseData,
  CreateCreditCardPaymentData,
  CreateInstallmentPaymentData
} from "./expense-service";

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
}

// =============================================
// CLIENT-SIDE EXPENSE SERVICE FACTORY
// =============================================

export function createExpenseServiceClient() {
  return new ExpenseServiceClient();
}
