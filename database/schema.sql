-- BudgetAI Database Schema
-- This file contains all the necessary tables and policies for the BudgetAI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER PROFILES TABLE
-- =============================================
-- Extends the auth.users table with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due')),
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================
-- CREDIT CARDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    card_name TEXT NOT NULL,
    card_type TEXT NOT NULL CHECK (card_type IN ('visa', 'mastercard', 'amex', 'discover', 'other')),
    last_four_digits TEXT NOT NULL CHECK (length(last_four_digits) = 4),
    card_holder_name TEXT NOT NULL,
    credit_limit DECIMAL(10,2) CHECK (credit_limit > 0),
    current_balance DECIMAL(10,2) DEFAULT 0 CHECK (current_balance >= 0),
    available_credit DECIMAL(10,2) GENERATED ALWAYS AS (credit_limit - current_balance) STORED,
    interest_rate DECIMAL(5,2) CHECK (interest_rate >= 0 AND interest_rate <= 100),
    minimum_payment DECIMAL(10,2) CHECK (minimum_payment >= 0),
    due_date INTEGER CHECK (due_date >= 1 AND due_date <= 31),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, last_four_digits, card_holder_name)
);

-- =============================================
-- BANK ACCOUNTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market', 'cd', 'investment', 'other')),
    bank_name TEXT NOT NULL,
    account_number_masked TEXT NOT NULL, -- Last 4 digits only for security
    routing_number_masked TEXT, -- Last 4 digits only for security
    current_balance DECIMAL(10,2) DEFAULT 0,
    available_balance DECIMAL(10,2) DEFAULT 0,
    interest_rate DECIMAL(5,2) CHECK (interest_rate >= 0 AND interest_rate <= 100),
    minimum_balance DECIMAL(10,2) DEFAULT 0 CHECK (minimum_balance >= 0),
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_number_masked, bank_name)
);

-- =============================================
-- INSTALLMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    remaining_amount DECIMAL(10,2) NOT NULL CHECK (remaining_amount >= 0),
    monthly_payment DECIMAL(10,2) NOT NULL CHECK (monthly_payment > 0),
    total_installments INTEGER NOT NULL CHECK (total_installments > 0),
    paid_installments INTEGER DEFAULT 0 CHECK (paid_installments >= 0),
    due_date DATE NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 0 CHECK (interest_rate >= 0 AND interest_rate <= 100),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_installment_progress CHECK (paid_installments <= total_installments)
);

-- =============================================
-- RECURRING PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.recurring_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    payment_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly')),
    is_active BOOLEAN DEFAULT true,
    auto_pay BOOLEAN DEFAULT false,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure payment is linked to either a credit card or bank account, but not both
    CONSTRAINT recurring_payment_account_check CHECK (
        (credit_card_id IS NOT NULL AND bank_account_id IS NULL) OR
        (credit_card_id IS NULL AND bank_account_id IS NOT NULL) OR
        (credit_card_id IS NULL AND bank_account_id IS NULL)
    )
);

-- =============================================
-- AI ANALYSIS TABLE (Premium Feature)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('monthly', 'weekly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    insights JSONB NOT NULL,
    recommendations JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BUDGETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    spent_amount DECIMAL(10,2) DEFAULT 0 CHECK (spent_amount >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#007acc',
    icon TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense', 'transfer', 'payment')) NOT NULL,
    date DATE NOT NULL,
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure transaction is linked to either a credit card or bank account, but not both
    CONSTRAINT transaction_account_check CHECK (
        (credit_card_id IS NOT NULL AND bank_account_id IS NULL) OR
        (credit_card_id IS NULL AND bank_account_id IS NOT NULL) OR
        (credit_card_id IS NULL AND bank_account_id IS NULL)
    )
);

-- =============================================
-- BUDGET CATEGORIES TABLE (Many-to-Many)
-- =============================================
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    allocated_amount DECIMAL(10,2) NOT NULL CHECK (allocated_amount > 0),
    spent_amount DECIMAL(10,2) DEFAULT 0 CHECK (spent_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(budget_id, category_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier, subscription_status);

-- Budgets indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_dates ON public.budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON public.budgets(is_active) WHERE is_active = true;

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_default ON public.categories(is_default) WHERE is_default = true;

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON public.transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);

-- Budget categories indexes
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget_id ON public.budget_categories(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_category_id ON public.budget_categories(category_id);

-- Credit cards indexes
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON public.credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_active ON public.credit_cards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_credit_cards_type ON public.credit_cards(card_type);

-- Bank accounts indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON public.bank_accounts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bank_accounts_primary ON public.bank_accounts(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON public.bank_accounts(account_type);

-- Installments indexes
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON public.installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_active ON public.installments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.installments(due_date);

-- Recurring payments indexes
CREATE INDEX IF NOT EXISTS idx_recurring_payments_user_id ON public.recurring_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_payments_active ON public.recurring_payments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_payments_due_day ON public.recurring_payments(due_day);
CREATE INDEX IF NOT EXISTS idx_recurring_payments_frequency ON public.recurring_payments(frequency);

-- AI analyses indexes
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON public.ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON public.ai_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_period ON public.ai_analyses(period_start, period_end);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- BUDGETS POLICIES
-- =============================================

-- Users can view their own budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own budgets
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own budgets
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own budgets
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- CATEGORIES POLICIES
-- =============================================

-- Users can view their own categories
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories
CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRANSACTIONS POLICIES
-- =============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- BUDGET CATEGORIES POLICIES
-- =============================================

-- Users can view budget categories for their budgets
CREATE POLICY "Users can view own budget categories" ON public.budget_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.budgets 
            WHERE budgets.id = budget_categories.budget_id 
            AND budgets.user_id = auth.uid()
        )
    );

-- Users can insert budget categories for their budgets
CREATE POLICY "Users can insert own budget categories" ON public.budget_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.budgets 
            WHERE budgets.id = budget_categories.budget_id 
            AND budgets.user_id = auth.uid()
        )
    );

-- Users can update budget categories for their budgets
CREATE POLICY "Users can update own budget categories" ON public.budget_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.budgets 
            WHERE budgets.id = budget_categories.budget_id 
            AND budgets.user_id = auth.uid()
        )
    );

-- Users can delete budget categories for their budgets
CREATE POLICY "Users can delete own budget categories" ON public.budget_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.budgets 
            WHERE budgets.id = budget_categories.budget_id 
            AND budgets.user_id = auth.uid()
        )
    );

-- =============================================
-- CREDIT CARDS POLICIES
-- =============================================

-- Users can view their own credit cards
CREATE POLICY "Users can view own credit cards" ON public.credit_cards
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own credit cards
CREATE POLICY "Users can insert own credit cards" ON public.credit_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own credit cards
CREATE POLICY "Users can update own credit cards" ON public.credit_cards
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own credit cards
CREATE POLICY "Users can delete own credit cards" ON public.credit_cards
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- BANK ACCOUNTS POLICIES
-- =============================================

-- Users can view their own bank accounts
CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bank accounts
CREATE POLICY "Users can insert own bank accounts" ON public.bank_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bank accounts
CREATE POLICY "Users can update own bank accounts" ON public.bank_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own bank accounts
CREATE POLICY "Users can delete own bank accounts" ON public.bank_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- INSTALLMENTS POLICIES
-- =============================================

-- Users can view their own installments
CREATE POLICY "Users can view own installments" ON public.installments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own installments
CREATE POLICY "Users can insert own installments" ON public.installments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own installments
CREATE POLICY "Users can update own installments" ON public.installments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own installments
CREATE POLICY "Users can delete own installments" ON public.installments
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- RECURRING PAYMENTS POLICIES
-- =============================================

-- Users can view their own recurring payments
CREATE POLICY "Users can view own recurring payments" ON public.recurring_payments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own recurring payments
CREATE POLICY "Users can insert own recurring payments" ON public.recurring_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own recurring payments
CREATE POLICY "Users can update own recurring payments" ON public.recurring_payments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own recurring payments
CREATE POLICY "Users can delete own recurring payments" ON public.recurring_payments
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- AI ANALYSES POLICIES (Premium Feature)
-- =============================================

-- Users can view their own AI analyses
CREATE POLICY "Users can view own AI analyses" ON public.ai_analyses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own AI analyses
CREATE POLICY "Users can insert own AI analyses" ON public.ai_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON public.budget_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON public.installments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_payments_updated_at BEFORE UPDATE ON public.recurring_payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- DEFAULT CATEGORIES
-- =============================================

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default expense categories
    INSERT INTO public.categories (user_id, name, description, color, icon, is_default)
    VALUES 
        (NEW.id, 'Food & Dining', 'Restaurants, groceries, and food delivery', '#ff6b6b', 'utensils', true),
        (NEW.id, 'Transportation', 'Gas, public transport, rideshare', '#4ecdc4', 'car', true),
        (NEW.id, 'Housing', 'Rent, mortgage, utilities', '#45b7d1', 'home', true),
        (NEW.id, 'Entertainment', 'Movies, games, subscriptions', '#96ceb4', 'tv', true),
        (NEW.id, 'Healthcare', 'Medical expenses, insurance', '#feca57', 'heart', true),
        (NEW.id, 'Shopping', 'Clothing, personal items', '#ff9ff3', 'shopping-bag', true),
        (NEW.id, 'Education', 'Books, courses, training', '#54a0ff', 'book', true),
        (NEW.id, 'Travel', 'Vacations, business trips', '#5f27cd', 'plane', true),
        (NEW.id, 'Other', 'Miscellaneous expenses', '#a55eea', 'more-horizontal', true);
    
    -- Insert default income categories
    INSERT INTO public.categories (user_id, name, description, color, icon, is_default)
    VALUES 
        (NEW.id, 'Salary', 'Regular employment income', '#2ed573', 'briefcase', true),
        (NEW.id, 'Freelance', 'Freelance and contract work', '#ffa502', 'user', true),
        (NEW.id, 'Business', 'Business income and profits', '#ff6348', 'building', true),
        (NEW.id, 'Investment', 'Dividends, capital gains', '#3742fa', 'trending-up', true),
        (NEW.id, 'Rental', 'Rental income from properties', '#ff9f43', 'home', true),
        (NEW.id, 'Side Hustle', 'Part-time or side business income', '#5f27cd', 'zap', true),
        (NEW.id, 'Bonus', 'Performance bonuses and incentives', '#00d2d3', 'gift', true),
        (NEW.id, 'Refund', 'Returns and refunds', '#ff6b6b', 'rotate-ccw', true),
        (NEW.id, 'Other Income', 'Other sources of income', '#2f3542', 'dollar-sign', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default categories when profile is created
CREATE TRIGGER create_default_categories_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();

-- =============================================
-- ACCOUNT MANAGEMENT FUNCTIONS
-- =============================================

-- Function to update credit card balance when transaction is added
CREATE OR REPLACE FUNCTION public.update_credit_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if transaction is linked to a credit card
    IF NEW.credit_card_id IS NOT NULL THEN
        -- Update credit card balance based on transaction type
        IF NEW.type = 'expense' THEN
            UPDATE public.credit_cards 
            SET current_balance = current_balance + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.credit_card_id;
        ELSIF NEW.type = 'payment' THEN
            UPDATE public.credit_cards 
            SET current_balance = current_balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.credit_card_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update bank account balance when transaction is added
CREATE OR REPLACE FUNCTION public.update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if transaction is linked to a bank account
    IF NEW.bank_account_id IS NOT NULL THEN
        -- Update bank account balance based on transaction type
        IF NEW.type = 'income' THEN
            UPDATE public.bank_accounts 
            SET current_balance = current_balance + NEW.amount,
                available_balance = available_balance + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.bank_account_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.bank_accounts 
            SET current_balance = current_balance - NEW.amount,
                available_balance = available_balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.bank_account_id;
        ELSIF NEW.type = 'transfer' THEN
            -- For transfers, we'll need to handle both accounts
            -- This is a simplified version - you might want to add more logic
            UPDATE public.bank_accounts 
            SET current_balance = current_balance - NEW.amount,
                available_balance = available_balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.bank_account_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to automatically update account balances
CREATE TRIGGER update_credit_card_balance_trigger
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_credit_card_balance();

CREATE TRIGGER update_bank_account_balance_trigger
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_bank_account_balance();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for user dashboard summary
CREATE OR REPLACE VIEW public.user_dashboard_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.subscription_tier,
    COUNT(DISTINCT b.id) as total_budgets,
    COUNT(DISTINCT t.id) as total_transactions,
    COUNT(DISTINCT cc.id) as total_credit_cards,
    COUNT(DISTINCT ba.id) as total_bank_accounts,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as net_income,
    -- Credit card summary
    COALESCE(SUM(cc.credit_limit), 0) as total_credit_limit,
    COALESCE(SUM(cc.current_balance), 0) as total_credit_balance,
    COALESCE(SUM(cc.available_credit), 0) as total_available_credit,
    -- Bank account summary
    COALESCE(SUM(ba.current_balance), 0) as total_bank_balance,
    COALESCE(SUM(ba.available_balance), 0) as total_available_bank_balance
FROM public.profiles p
LEFT JOIN public.budgets b ON p.id = b.user_id AND b.is_active = true
LEFT JOIN public.transactions t ON p.id = t.user_id
LEFT JOIN public.credit_cards cc ON p.id = cc.user_id AND cc.is_active = true
LEFT JOIN public.bank_accounts ba ON p.id = ba.user_id AND ba.is_active = true
GROUP BY p.id, p.email, p.full_name, p.subscription_tier;

-- Grant access to the view
GRANT SELECT ON public.user_dashboard_summary TO authenticated;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with additional information';
COMMENT ON TABLE public.budgets IS 'User budgets with time periods and spending limits';
COMMENT ON TABLE public.categories IS 'Transaction categories for organizing expenses and income';
COMMENT ON TABLE public.transactions IS 'Individual financial transactions (income/expenses/transfers/payments)';
COMMENT ON TABLE public.budget_categories IS 'Many-to-many relationship between budgets and categories';
COMMENT ON TABLE public.credit_cards IS 'User credit card accounts with balances, limits, and payment information';
COMMENT ON TABLE public.bank_accounts IS 'User bank accounts with balances and account details';
COMMENT ON TABLE public.installments IS 'Installment payment plans for purchases and loans';
COMMENT ON TABLE public.recurring_payments IS 'Recurring monthly payments and subscriptions';
COMMENT ON TABLE public.ai_analyses IS 'AI-generated financial analyses and insights (premium feature)';

COMMENT ON COLUMN public.profiles.subscription_tier IS 'User subscription level: free or premium';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status';
COMMENT ON COLUMN public.budgets.is_active IS 'Whether the budget is currently active';
COMMENT ON COLUMN public.categories.is_default IS 'Whether this is a default category created for new users';
COMMENT ON COLUMN public.transactions.tags IS 'Array of tags for additional categorization';
COMMENT ON COLUMN public.transactions.credit_card_id IS 'Reference to credit card used for this transaction';
COMMENT ON COLUMN public.transactions.bank_account_id IS 'Reference to bank account used for this transaction';
COMMENT ON COLUMN public.credit_cards.available_credit IS 'Computed column: credit_limit - current_balance';
COMMENT ON COLUMN public.credit_cards.last_four_digits IS 'Last 4 digits of credit card for identification (security)';
COMMENT ON COLUMN public.bank_accounts.account_number_masked IS 'Last 4 digits of account number for identification (security)';
COMMENT ON COLUMN public.bank_accounts.routing_number_masked IS 'Last 4 digits of routing number for identification (security)';
COMMENT ON COLUMN public.bank_accounts.is_primary IS 'Whether this is the user primary bank account';
COMMENT ON COLUMN public.ai_analyses.insights IS 'JSON object containing AI-generated insights';
COMMENT ON COLUMN public.ai_analyses.recommendations IS 'JSON object containing AI-generated recommendations';

-- =============================================
-- ANALYTICS VIEWS
-- =============================================
-- Optimized views for analytics queries

-- Optimized monthly transaction summary for analytics
CREATE OR REPLACE VIEW public.analytics_monthly_transactions AS
SELECT 
    t.user_id,
    DATE_TRUNC('month', t.date) as month,
    t.type,
    c.name as category_name,
    c.color as category_color,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount,
    MIN(t.amount) as min_amount,
    MAX(t.amount) as max_amount
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
WHERE t.date >= CURRENT_DATE - INTERVAL '12 months'
  AND t.user_id IS NOT NULL
GROUP BY t.user_id, DATE_TRUNC('month', t.date), t.type, c.name, c.color
HAVING COUNT(*) > 0;

-- Daily transaction trends for analytics
CREATE OR REPLACE VIEW public.analytics_daily_transactions AS
SELECT 
    t.user_id,
    DATE_TRUNC('day', t.date) as day,
    t.type,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount
FROM public.transactions t
WHERE t.date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY t.user_id, DATE_TRUNC('day', t.date), t.type;

-- Optimized category spending analysis
CREATE OR REPLACE VIEW public.analytics_category_spending AS
SELECT 
    t.user_id,
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    t.type,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount,
    DATE_TRUNC('month', t.date) as month
FROM public.transactions t
JOIN public.categories c ON t.category_id = c.id
WHERE t.date >= CURRENT_DATE - INTERVAL '12 months'
  AND t.user_id IS NOT NULL
  AND c.id IS NOT NULL
GROUP BY t.user_id, c.id, c.name, c.color, t.type, DATE_TRUNC('month', t.date)
HAVING COUNT(*) > 0;

-- Credit card usage analytics
CREATE OR REPLACE VIEW public.analytics_credit_card_usage AS
SELECT 
    cc.user_id,
    cc.id as card_id,
    cc.card_name,
    cc.card_type,
    cc.last_four_digits,
    cc.credit_limit,
    cc.current_balance,
    cc.available_credit,
    ROUND((cc.current_balance / cc.credit_limit * 100), 2) as usage_percentage,
    cc.due_date,
    COUNT(t.id) as transaction_count,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as monthly_expenses
FROM public.credit_cards cc
LEFT JOIN public.transactions t ON cc.id = t.credit_card_id 
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
WHERE cc.is_active = true
GROUP BY cc.user_id, cc.id, cc.card_name, cc.card_type, cc.last_four_digits, 
         cc.credit_limit, cc.current_balance, cc.available_credit, cc.due_date;

-- Bank account analytics
CREATE OR REPLACE VIEW public.analytics_bank_accounts AS
SELECT 
    ba.user_id,
    ba.id as account_id,
    ba.account_name,
    ba.account_type,
    ba.account_number_masked,
    ba.current_balance,
    ba.available_balance,
    COUNT(t.id) as transaction_count,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as monthly_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as monthly_expenses
FROM public.bank_accounts ba
LEFT JOIN public.transactions t ON ba.id = t.bank_account_id 
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
WHERE ba.is_active = true
GROUP BY ba.user_id, ba.id, ba.account_name, ba.account_type, 
         ba.account_number_masked, ba.current_balance, ba.available_balance;

-- Recurring payments analytics
CREATE OR REPLACE VIEW public.analytics_recurring_payments AS
SELECT 
    rp.user_id,
    rp.id as payment_id,
    rp.payment_type,
    rp.amount,
    rp.due_day,
    rp.frequency,
    rp.is_active,
    rp.auto_pay,
    c.name as category_name,
    c.color as category_color,
    CASE 
        WHEN rp.due_day < EXTRACT(DAY FROM CURRENT_DATE) THEN 'overdue'
        WHEN rp.due_day = EXTRACT(DAY FROM CURRENT_DATE) THEN 'due_today'
        ELSE 'upcoming'
    END as payment_status
FROM public.recurring_payments rp
LEFT JOIN public.categories c ON rp.category_id = c.id
WHERE rp.is_active = true;

-- Installment analytics
CREATE OR REPLACE VIEW public.analytics_installments AS
SELECT 
    i.user_id,
    i.id as installment_id,
    i.item_name,
    i.total_amount,
    i.remaining_amount,
    i.monthly_payment,
    i.total_installments,
    i.paid_installments,
    (i.total_installments - i.paid_installments) as remaining_installments,
    i.due_date,
    i.interest_rate,
    ROUND((i.paid_installments::DECIMAL / i.total_installments * 100), 2) as completion_percentage,
    CASE 
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        WHEN i.due_date = CURRENT_DATE THEN 'due_today'
        ELSE 'upcoming'
    END as payment_status
FROM public.installments i
WHERE i.is_active = true;

-- Budget vs actual spending analytics
CREATE OR REPLACE VIEW public.analytics_budget_vs_actual AS
SELECT 
    b.user_id,
    b.id as budget_id,
    b.name as budget_name,
    b.start_date,
    b.end_date,
    b.total_amount as budget_amount,
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    bc.allocated_amount,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as actual_spent,
    ROUND((COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) / bc.allocated_amount * 100), 2) as usage_percentage
FROM public.budgets b
JOIN public.budget_categories bc ON b.id = bc.budget_id
JOIN public.categories c ON bc.category_id = c.id
LEFT JOIN public.transactions t ON c.id = t.category_id 
    AND t.date >= b.start_date 
    AND t.date <= b.end_date
WHERE b.is_active = true
GROUP BY b.user_id, b.id, b.name, b.start_date, b.end_date, b.total_amount,
         c.id, c.name, c.color, bc.allocated_amount;

-- High-value transactions for analytics
CREATE OR REPLACE VIEW public.analytics_high_value_transactions AS
SELECT 
    t.user_id,
    t.id as transaction_id,
    t.amount,
    t.description,
    t.type,
    t.date,
    t.notes,
    c.name as category_name,
    c.color as category_color,
    cc.card_name as credit_card_name,
    ba.account_name as bank_account_name
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.credit_cards cc ON t.credit_card_id = cc.id
LEFT JOIN public.bank_accounts ba ON t.bank_account_id = ba.id
WHERE t.amount >= 100 -- High-value threshold
ORDER BY t.amount DESC;

-- Comments for analytics views
COMMENT ON VIEW public.analytics_monthly_transactions IS 'Monthly transaction summaries for analytics charts and trends';
COMMENT ON VIEW public.analytics_daily_transactions IS 'Daily transaction trends for line charts and activity analysis';
COMMENT ON VIEW public.analytics_category_spending IS 'Category-wise spending analysis for pie charts and breakdowns';
COMMENT ON VIEW public.analytics_credit_card_usage IS 'Credit card usage analytics with balances and transaction counts';
COMMENT ON VIEW public.analytics_bank_accounts IS 'Bank account analytics with balances and transaction summaries';
COMMENT ON VIEW public.analytics_recurring_payments IS 'Recurring payment analytics with status and scheduling information';
COMMENT ON VIEW public.analytics_installments IS 'Installment payment analytics with progress and status tracking';
COMMENT ON VIEW public.analytics_budget_vs_actual IS 'Budget vs actual spending comparison for progress tracking';
COMMENT ON VIEW public.analytics_high_value_transactions IS 'High-value transactions for detailed analysis and monitoring';

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================
-- Strategic indexes for optimal query performance

-- Core transaction indexes (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_category ON public.transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_amount ON public.transactions(user_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_date_recent ON public.transactions(date DESC) WHERE date >= '2023-01-01';

-- Credit card indexes
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id_active ON public.credit_cards(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id_balance ON public.credit_cards(user_id, current_balance DESC);

-- Bank account indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id_active ON public.bank_accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id_balance ON public.bank_accounts(user_id, current_balance DESC);

-- Budget indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_active ON public.budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id_dates ON public.budgets(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget_id ON public.budget_categories(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_category_id ON public.budget_categories(category_id);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id_name ON public.categories(user_id, name);

-- Installment indexes
CREATE INDEX IF NOT EXISTS idx_installments_user_id_active ON public.installments(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_installments_user_id_due_date ON public.installments(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_installments_user_id_status ON public.installments(user_id, due_date, is_active);

-- Recurring payment indexes
CREATE INDEX IF NOT EXISTS idx_recurring_payments_user_id_active ON public.recurring_payments(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_payments_user_id_due_day ON public.recurring_payments(user_id, due_day);
CREATE INDEX IF NOT EXISTS idx_recurring_payments_user_id_frequency ON public.recurring_payments(user_id, frequency);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier, subscription_status);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_transactions_analytics ON public.transactions(user_id, date, type, category_id, amount) 
WHERE date >= '2023-01-01';

CREATE INDEX IF NOT EXISTS idx_transactions_monthly ON public.transactions(user_id, date, type);

-- Comments for indexes
COMMENT ON INDEX idx_transactions_user_id_date IS 'Optimizes user transaction queries by date (most common query pattern)';
COMMENT ON INDEX idx_transactions_analytics IS 'Composite index for analytics queries with date filtering';
COMMENT ON INDEX idx_credit_cards_user_id_active IS 'Optimizes active credit card queries per user';
COMMENT ON INDEX idx_bank_accounts_user_id_active IS 'Optimizes active bank account queries per user';
COMMENT ON INDEX idx_budgets_user_id_dates IS 'Optimizes budget queries with date range filtering';
COMMENT ON INDEX idx_installments_user_id_due_date IS 'Optimizes installment queries by due date for scheduling';
COMMENT ON INDEX idx_recurring_payments_user_id_due_day IS 'Optimizes recurring payment queries by due day';

-- =============================================
-- EXPENSE MANAGEMENT SYSTEM EXTENSIONS
-- =============================================
-- Additional tables and fields for comprehensive expense management

-- Extend transactions table for expense management
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_ocr_data JSONB;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'pending', 'completed', 'failed'));
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS installment_number INTEGER;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS installment_total INTEGER;

-- Income-specific fields
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS income_source TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS income_type TEXT CHECK (income_type IN ('general', 'recurring', 'refund', 'transfer')) DEFAULT 'general';

-- Payment methods table (user configurable)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank_account', 'credit_card', 'e_wallet', 'other')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Payment notifications table for due payments
CREATE TABLE IF NOT EXISTS public.payment_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recurring_due', 'installment_due', 'credit_card_due')),
    reference_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipt images table for storing receipt metadata
CREATE TABLE IF NOT EXISTS public.receipt_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    ocr_data JSONB,
    ocr_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for payment_method_id
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_payment_method 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;

-- =============================================
-- EXPENSE MANAGEMENT INDEXES
-- =============================================

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id_active ON public.payment_methods(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id_type ON public.payment_methods(user_id, type);

-- Payment notifications indexes
CREATE INDEX IF NOT EXISTS idx_payment_notifications_user_id_unread ON public.payment_notifications(user_id, is_read, is_dismissed);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_due_date ON public.payment_notifications(due_date) WHERE is_read = false AND is_dismissed = false;
CREATE INDEX IF NOT EXISTS idx_payment_notifications_type ON public.payment_notifications(type, due_date);

-- Receipt images indexes
CREATE INDEX IF NOT EXISTS idx_receipt_images_user_id ON public.receipt_images(user_id);
CREATE INDEX IF NOT EXISTS idx_receipt_images_transaction_id ON public.receipt_images(transaction_id);

-- Enhanced transaction indexes for expense management
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON public.transactions(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_installment ON public.transactions(user_id, installment_number, installment_total) WHERE installment_number IS NOT NULL;

-- Income-specific indexes
CREATE INDEX IF NOT EXISTS idx_transactions_income_type ON public.transactions(user_id, income_type) WHERE type = 'income';
CREATE INDEX IF NOT EXISTS idx_transactions_income_source ON public.transactions(user_id, income_source) WHERE type = 'income';
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON public.transactions(user_id, type, status);

-- =============================================
-- EXPENSE MANAGEMENT FUNCTIONS
-- =============================================

-- Function to create payment notification
CREATE OR REPLACE FUNCTION create_payment_notification(
    p_user_id UUID,
    p_type TEXT,
    p_reference_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_due_date DATE,
    p_amount DECIMAL(10,2)
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.payment_notifications (
        user_id, type, reference_id, title, message, due_date, amount
    ) VALUES (
        p_user_id, p_type, p_reference_id, p_title, p_message, p_due_date, p_amount
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update credit card balance after payment
CREATE OR REPLACE FUNCTION update_credit_card_balance_after_payment(
    p_credit_card_id UUID,
    p_payment_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.credit_cards 
    SET 
        current_balance = GREATEST(0, current_balance - p_payment_amount),
        updated_at = NOW()
    WHERE id = p_credit_card_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to update installment progress after payment
CREATE OR REPLACE FUNCTION update_installment_progress_after_payment(
    p_installment_id UUID,
    p_payment_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
    installment_record RECORD;
BEGIN
    -- Get current installment data
    SELECT * INTO installment_record 
    FROM public.installments 
    WHERE id = p_installment_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update installment progress
    UPDATE public.installments 
    SET 
        paid_installments = paid_installments + 1,
        remaining_amount = GREATEST(0, remaining_amount - p_payment_amount),
        updated_at = NOW()
    WHERE id = p_installment_id;
    
    -- Create notification for next payment if not completed
    IF installment_record.paid_installments + 1 < installment_record.total_installments THEN
        PERFORM create_payment_notification(
            installment_record.user_id,
            'installment_due',
            p_installment_id,
            'Installment Payment Due',
            'Your next installment payment for ' || installment_record.item_name || ' is due.',
            installment_record.due_date + INTERVAL '1 month',
            installment_record.monthly_payment
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to create recurring payment notification
CREATE OR REPLACE FUNCTION create_recurring_payment_notification(
    p_recurring_payment_id UUID
) RETURNS UUID AS $$
DECLARE
    recurring_record RECORD;
    next_due_date DATE;
    notification_id UUID;
BEGIN
    -- Get recurring payment data
    SELECT * INTO recurring_record 
    FROM public.recurring_payments 
    WHERE id = p_recurring_payment_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Calculate next due date based on frequency
    CASE recurring_record.frequency
        WHEN 'weekly' THEN
            next_due_date := CURRENT_DATE + INTERVAL '1 week';
        WHEN 'monthly' THEN
            next_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + (recurring_record.due_day - 1) * INTERVAL '1 day';
        WHEN 'quarterly' THEN
            next_due_date := DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '3 months';
        WHEN 'yearly' THEN
            next_due_date := DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year';
        ELSE
            next_due_date := CURRENT_DATE + INTERVAL '1 month';
    END CASE;
    
    -- Create notification
    SELECT create_payment_notification(
        recurring_record.user_id,
        'recurring_due',
        p_recurring_payment_id,
        'Recurring Payment Due',
        'Your recurring payment for ' || recurring_record.description || ' is due.',
        next_due_date,
        recurring_record.amount
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- EXPENSE MANAGEMENT TRIGGERS
-- =============================================

-- Trigger to update credit card balance when payment transaction is created
CREATE OR REPLACE FUNCTION trigger_update_credit_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if this is a credit card payment and status is completed
    IF NEW.credit_card_id IS NOT NULL 
       AND NEW.type = 'expense' 
       AND NEW.status = 'completed' 
       AND NEW.description ILIKE '%payment%' THEN
        
        PERFORM update_credit_card_balance_after_payment(NEW.credit_card_id, NEW.amount);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_credit_card_balance_update
    AFTER INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_credit_card_balance();

-- Trigger to update installment progress when payment transaction is created
CREATE OR REPLACE FUNCTION trigger_update_installment_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if this is an installment payment and status is completed
    IF NEW.installment_number IS NOT NULL 
       AND NEW.type = 'expense' 
       AND NEW.status = 'completed' THEN
        
        -- Find the installment record (we need to link this properly)
        -- For now, we'll handle this in the application layer
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INCOME MANAGEMENT VIEW
-- =============================================

-- Comprehensive view for income management
CREATE OR REPLACE VIEW public.income_management_view AS
SELECT 
    t.id,
    t.user_id,
    t.date,
    t.description,
    t.amount,
    t.type,
    t.status,
    t.notes,
    t.income_source,
    t.income_type,
    t.created_at,
    t.updated_at,
    
    -- Category information
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    
    -- Payment method information
    pm.id as payment_method_id,
    pm.name as payment_method_name,
    pm.type as payment_method_type,
    
    -- Bank account information
    ba.id as bank_account_id,
    ba.account_name as bank_account_name,
    ba.account_type as bank_account_type,
    
    -- Computed fields
    CASE 
        WHEN t.income_type = 'general' THEN 'General Income'
        WHEN t.income_type = 'recurring' THEN 'Recurring Income'
        WHEN t.income_type = 'refund' THEN 'Refund'
        WHEN t.income_type = 'transfer' THEN 'Transfer'
        ELSE 'Income'
    END as income_type_label,
    
    CASE 
        WHEN t.income_type = 'general' THEN '💼'
        WHEN t.income_type = 'recurring' THEN '🔄'
        WHEN t.income_type = 'refund' THEN '💸'
        WHEN t.income_type = 'transfer' THEN '🔄'
        ELSE '💰'
    END as income_icon

FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.bank_accounts ba ON t.bank_account_id = ba.id
WHERE t.type = 'income';

-- =============================================
-- EXPENSE MANAGEMENT VIEWS
-- =============================================

-- Unified expenses view for the expense page
CREATE OR REPLACE VIEW public.expense_management_view AS
SELECT 
    t.id,
    t.user_id,
    t.date,
    t.description,
    t.amount,
    t.type,
    t.status,
    t.notes,
    t.installment_number,
    t.installment_total,
    t.receipt_url,
    t.created_at,
    t.updated_at,
    
    -- Category information
    c.name as category_name,
    c.color as category_color,
    
    -- Payment method information
    pm.name as payment_method_name,
    pm.type as payment_method_type,
    
    -- Credit card information
    cc.card_name as credit_card_name,
    cc.last_four_digits as credit_card_last_four,
    
    -- Bank account information
    ba.account_name as bank_account_name,
    ba.account_type as bank_account_type,
    
    -- Installment information
    i.item_name as installment_item_name,
    i.total_installments,
    i.paid_installments,
    i.remaining_amount as installment_remaining,
    
    -- Recurring payment information
    rp.description as recurring_description,
    rp.frequency as recurring_frequency,
    
    -- Computed fields
    CASE 
        WHEN t.installment_number IS NOT NULL THEN 'Installment Payment'
        WHEN t.credit_card_id IS NOT NULL AND t.description ILIKE '%payment%' THEN 'Credit Card Payment'
        WHEN t.description ILIKE '%subscription%' OR t.description ILIKE '%recurring%' THEN 'Recurring Payment'
        ELSE 'Expense'
    END as expense_type,
    
    CASE 
        WHEN t.installment_number IS NOT NULL THEN '📅'
        WHEN t.credit_card_id IS NOT NULL AND t.description ILIKE '%payment%' THEN '💳'
        WHEN t.description ILIKE '%subscription%' OR t.description ILIKE '%recurring%' THEN '🔁'
        ELSE '🛒'
    END as expense_icon

FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.credit_cards cc ON t.credit_card_id = cc.id
LEFT JOIN public.bank_accounts ba ON t.bank_account_id = ba.id
LEFT JOIN public.installments i ON t.installment_number IS NOT NULL AND i.user_id = t.user_id
LEFT JOIN public.recurring_payments rp ON t.description ILIKE '%' || rp.description || '%' AND rp.user_id = t.user_id
WHERE t.type = 'expense'
ORDER BY t.date DESC, t.created_at DESC;

-- Comments for new tables and functions
COMMENT ON TABLE public.payment_methods IS 'User-configurable payment methods for expense tracking';
COMMENT ON TABLE public.payment_notifications IS 'Notifications for due payments and recurring expenses';
COMMENT ON TABLE public.receipt_images IS 'Receipt images and OCR data for expense transactions';
COMMENT ON VIEW public.expense_management_view IS 'Unified view of all expense-related transactions with computed fields';
COMMENT ON FUNCTION create_payment_notification IS 'Creates a payment notification for due payments';
COMMENT ON FUNCTION update_credit_card_balance_after_payment IS 'Updates credit card balance after payment transaction';
COMMENT ON FUNCTION update_installment_progress_after_payment IS 'Updates installment progress and creates next payment notification';
COMMENT ON FUNCTION create_recurring_payment_notification IS 'Creates notification for recurring payment due date';
