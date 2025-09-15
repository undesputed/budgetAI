// Database types for the budgeting application

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  budget_id?: string;
  category_id?: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  date: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category_id: string;
  allocated_amount: number;
  spent_amount: number;
  created_at: string;
  updated_at: string;
}

// Form types
export interface CreateBudgetForm {
  name: string;
  description?: string;
  total_amount: number;
  start_date: string;
  end_date: string;
}

export interface CreateTransactionForm {
  amount: number;
  description: string;
  type: "income" | "expense";
  date: string;
  budget_id?: string;
  category_id?: string;
}

export interface CreateCategoryForm {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}
