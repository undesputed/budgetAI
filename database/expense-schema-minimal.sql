-- =============================================
-- MINIMAL EXPENSE SCHEMA FOR TESTING
-- =============================================
-- This is a minimal version of the schema needed for the expense page to work

-- Extend transactions table with expense-specific fields
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method_id UUID,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_ocr_data JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'pending', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS installment_number INTEGER,
ADD COLUMN IF NOT EXISTS installment_total INTEGER;

-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank_account', 'credit_card', 'e_wallet', 'other')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create payment notifications table
CREATE TABLE IF NOT EXISTS public.payment_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('recurring_due', 'installment_due', 'credit_card_due')),
    reference_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    amount DECIMAL(10,2),
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipt images table
CREATE TABLE IF NOT EXISTS public.receipt_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    ocr_data JSONB,
    ocr_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for payment methods
ALTER TABLE public.transactions 
ADD CONSTRAINT IF NOT EXISTS fk_transactions_payment_method 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_user_id ON public.payment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_due_date ON public.payment_notifications(due_date);
CREATE INDEX IF NOT EXISTS idx_receipt_images_user_id ON public.receipt_images(user_id);
CREATE INDEX IF NOT EXISTS idx_receipt_images_transaction_id ON public.receipt_images(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON public.transactions(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Create expense management view
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
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    
    -- Payment method information
    pm.id as payment_method_id,
    pm.name as payment_method_name,
    pm.type as payment_method_type,
    
    -- Credit card information (if applicable)
    cc.id as credit_card_id,
    cc.name as credit_card_name,
    cc.last_four as credit_card_last_four,
    
    -- Bank account information (if applicable)
    ba.id as bank_account_id,
    ba.name as bank_account_name,
    ba.type as bank_account_type,
    
    -- Computed fields
    CASE 
        WHEN t.type = 'expense' THEN 'Expense'
        WHEN cc.id IS NOT NULL THEN 'Credit Card Payment'
        WHEN i.id IS NOT NULL THEN 'Installment Payment'
        WHEN rp.id IS NOT NULL THEN 'Recurring Payment'
        ELSE 'Expense'
    END as expense_type,
    
    CASE 
        WHEN t.type = 'expense' THEN 'shopping-cart'
        WHEN cc.id IS NOT NULL THEN 'credit-card'
        WHEN i.id IS NOT NULL THEN 'rotate-ccw'
        WHEN rp.id IS NOT NULL THEN 'calendar'
        ELSE 'shopping-cart'
    END as expense_icon

FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.credit_cards cc ON pm.id = cc.payment_method_id
LEFT JOIN public.bank_accounts ba ON pm.id = ba.payment_method_id
LEFT JOIN public.installments i ON t.installment_id = i.id
LEFT JOIN public.recurring_payments rp ON t.recurring_payment_id = rp.id
WHERE t.type = 'expense';

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payment methods" ON public.payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON public.payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment notifications" ON public.payment_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment notifications" ON public.payment_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment notifications" ON public.payment_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment notifications" ON public.payment_notifications
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own receipt images" ON public.receipt_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipt images" ON public.receipt_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipt images" ON public.receipt_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipt images" ON public.receipt_images
    FOR DELETE USING (auth.uid() = user_id);

-- Add some sample payment methods for testing
INSERT INTO public.payment_methods (user_id, name, type, description, sort_order) VALUES
    (auth.uid(), 'Cash', 'cash', 'Physical cash payments', 1),
    (auth.uid(), 'Debit Card', 'bank_account', 'Primary debit card', 2),
    (auth.uid(), 'Credit Card', 'credit_card', 'Primary credit card', 3)
ON CONFLICT (user_id, name) DO NOTHING;
