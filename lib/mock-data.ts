// Mock data for dashboard components
// This matches the database schema structure

export interface MockTransaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense' | 'transfer' | 'payment';
  date: string;
  category: string;
  notes?: string;
}

export interface MockCreditCard {
  id: string;
  card_name: string;
  card_type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  last_four_digits: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  usage_percentage: number;
}

export interface MockInstallment {
  id: string;
  item_name: string;
  remaining_amount: number;
  due_date: string;
  monthly_payment: number;
  total_installments: number;
  paid_installments: number;
}

export interface MockMonthlyPayment {
  id: string;
  payment_type: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  description: string;
}

// Mock Data
export const mockTransactions: MockTransaction[] = [
  {
    id: "1",
    amount: 150.00,
    description: "Grocery Shopping",
    type: "expense",
    date: "2024-01-15",
    category: "Food & Dining",
    notes: "Weekly groceries"
  },
  {
    id: "2",
    amount: 1200.00,
    description: "Salary",
    type: "income",
    date: "2024-01-14",
    category: "Income",
    notes: "Monthly salary"
  },
  {
    id: "3",
    amount: 85.50,
    description: "Gas Station",
    type: "expense",
    date: "2024-01-13",
    category: "Transportation",
    notes: "Fuel for car"
  },
  {
    id: "4",
    amount: 45.00,
    description: "Netflix Subscription",
    type: "expense",
    date: "2024-01-12",
    category: "Entertainment",
    notes: "Monthly subscription"
  },
  {
    id: "5",
    amount: 200.00,
    description: "Electric Bill",
    type: "expense",
    date: "2024-01-11",
    category: "Utilities",
    notes: "Monthly electricity"
  },
  {
    id: "6",
    amount: 75.00,
    description: "Restaurant",
    type: "expense",
    date: "2024-01-10",
    category: "Food & Dining",
    notes: "Dinner out"
  },
  {
    id: "7",
    amount: 300.00,
    description: "Car Payment",
    type: "payment",
    date: "2024-01-09",
    category: "Transportation",
    notes: "Monthly car loan"
  },
  {
    id: "8",
    amount: 50.00,
    description: "Transfer to Savings",
    type: "transfer",
    date: "2024-01-08",
    category: "Savings",
    notes: "Monthly savings transfer"
  }
];

export const mockCreditCards: MockCreditCard[] = [
  {
    id: "1",
    card_name: "Chase Freedom",
    card_type: "visa",
    last_four_digits: "1234",
    credit_limit: 5000,
    current_balance: 1250.50,
    available_credit: 3749.50,
    usage_percentage: 25.01
  },
  {
    id: "2",
    card_name: "Capital One Venture",
    card_type: "mastercard",
    last_four_digits: "5678",
    credit_limit: 8000,
    current_balance: 3200.00,
    available_credit: 4800.00,
    usage_percentage: 40.00
  },
  {
    id: "3",
    card_name: "American Express Gold",
    card_type: "amex",
    last_four_digits: "9012",
    credit_limit: 10000,
    current_balance: 750.25,
    available_credit: 9249.75,
    usage_percentage: 7.50
  },
  {
    id: "4",
    card_name: "Discover Cash Back",
    card_type: "discover",
    last_four_digits: "3456",
    credit_limit: 3000,
    current_balance: 2100.00,
    available_credit: 900.00,
    usage_percentage: 70.00
  },
  {
    id: "5",
    card_name: "Bank of America",
    card_type: "visa",
    last_four_digits: "7890",
    credit_limit: 6000,
    current_balance: 4500.75,
    available_credit: 1499.25,
    usage_percentage: 75.01
  }
];

export const mockInstallments: MockInstallment[] = [
  {
    id: "1",
    item_name: "MacBook Pro",
    remaining_amount: 2400.00,
    due_date: "2024-02-15",
    monthly_payment: 200.00,
    total_installments: 24,
    paid_installments: 8
  },
  {
    id: "2",
    item_name: "iPhone 15",
    remaining_amount: 600.00,
    due_date: "2024-02-20",
    monthly_payment: 50.00,
    total_installments: 24,
    paid_installments: 12
  },
  {
    id: "3",
    item_name: "Furniture Set",
    remaining_amount: 1200.00,
    due_date: "2024-03-01",
    monthly_payment: 150.00,
    total_installments: 12,
    paid_installments: 4
  },
  {
    id: "4",
    item_name: "Gym Membership",
    remaining_amount: 300.00,
    due_date: "2024-02-28",
    monthly_payment: 30.00,
    total_installments: 12,
    paid_installments: 2
  },
  {
    id: "5",
    item_name: "Car Insurance",
    remaining_amount: 800.00,
    due_date: "2024-02-10",
    monthly_payment: 100.00,
    total_installments: 12,
    paid_installments: 4
  }
];

export const mockMonthlyPayments: MockMonthlyPayment[] = [
  {
    id: "1",
    payment_type: "Rent",
    amount: 1200.00,
    status: "paid",
    due_date: "2024-01-01",
    description: "Monthly apartment rent"
  },
  {
    id: "2",
    payment_type: "Car Loan",
    amount: 350.00,
    status: "pending",
    due_date: "2024-01-20",
    description: "Monthly car payment"
  },
  {
    id: "3",
    payment_type: "Student Loan",
    amount: 280.00,
    status: "pending",
    due_date: "2024-01-25",
    description: "Monthly student loan payment"
  },
  {
    id: "4",
    payment_type: "Internet",
    amount: 65.00,
    status: "paid",
    due_date: "2024-01-15",
    description: "Monthly internet service"
  },
  {
    id: "5",
    payment_type: "Phone Bill",
    amount: 85.00,
    status: "overdue",
    due_date: "2024-01-10",
    description: "Monthly phone service"
  }
];

// Calculated summary data
export const getSummaryData = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = mockTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransactions = monthlyTransactions.length;

  // Mock budget data
  const totalBudget = 3000;
  const totalBudgetRemaining = totalBudget - totalExpenses;

  return {
    totalExpenses,
    totalIncome,
    totalTransactions,
    totalBudgetRemaining,
    totalBudget
  };
};

// Category data for pie chart
export const getExpenseCategories = () => {
  const expenses = mockTransactions.filter(t => t.type === 'expense');
  const categoryTotals = expenses.reduce((acc, transaction) => {
    const category = transaction.category;
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: ""
  }));
};

// Monthly trends data
export const getMonthlyTrends = () => {
  return [
    { month: "Aug", expenses: 2800, transactions: 45, transfers: 200, budget: 3000 },
    { month: "Sep", expenses: 3200, transactions: 52, transfers: 250, budget: 3000 },
    { month: "Oct", expenses: 2900, transactions: 48, transfers: 180, budget: 3000 },
    { month: "Nov", expenses: 3100, transactions: 55, transfers: 220, budget: 3000 },
    { month: "Dec", expenses: 3500, transactions: 62, transfers: 300, budget: 3000 },
    { month: "Jan", expenses: 2800, transactions: 50, transfers: 200, budget: 3000 }
  ];
};
