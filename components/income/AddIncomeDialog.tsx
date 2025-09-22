'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { createExpenseServiceClient, CreateIncomeData } from '@/lib/services/expense-service-client';

const incomeSchema = z.object({
  date: z.date({
    message: 'Date is required',
  }),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category_id: z.string().optional(),
  payment_method_id: z.string().optional(),
  bank_account_id: z.string().optional(),
  income_source: z.string().optional(),
  income_type: z.enum(['general', 'recurring', 'refund', 'transfer']),
  status: z.enum(['draft', 'pending', 'completed', 'failed']),
  notes: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onIncomeCreated: () => void;
}

export function AddIncomeDialog({ 
  open, 
  onOpenChange, 
  userId, 
  onIncomeCreated 
}: AddIncomeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: new Date(),
      description: '',
      amount: 0,
      category_id: '',
      payment_method_id: '',
      bank_account_id: '',
      income_source: '',
      income_type: 'general',
      status: 'completed',
      notes: '',
    },
  });

  const expenseService = createExpenseServiceClient();

  // Reset form and fetch data when dialog opens
  useEffect(() => {
    if (open) {
      // Reset form to default values
      form.reset({
        date: new Date(),
        description: '',
        amount: 0,
        category_id: '',
        payment_method_id: '',
        bank_account_id: '',
        income_source: '',
        income_type: 'general',
        status: 'completed',
        notes: '',
      });

      const fetchData = async () => {
        // First, try to get categories
        let categoriesData = await expenseService.getCategories(userId);
        
        // If no categories exist, create default ones
        if (categoriesData.length === 0) {
          const created = await expenseService.createDefaultCategories(userId);
          if (created) {
            categoriesData = await expenseService.getCategories(userId);
          }
        }
        
        const [paymentMethodsData, bankAccountsData] = await Promise.all([
          expenseService.getPaymentMethods(userId),
          expenseService.getBankAccounts(userId)
        ]);
        
        setCategories(categoriesData);
        setPaymentMethods(paymentMethodsData);
        setBankAccounts(bankAccountsData);
      };
      fetchData();
    }
  }, [open, userId, form]);

  const onSubmit = async (data: IncomeFormData) => {
    try {
      setLoading(true);

      const incomeData: CreateIncomeData = {
        date: format(data.date, 'yyyy-MM-dd'),
        description: data.description,
        amount: data.amount,
        category_id: data.category_id || undefined,
        payment_method_id: data.payment_method_id || undefined,
        bank_account_id: data.bank_account_id || undefined,
        income_source: data.income_source || undefined,
        income_type: data.income_type,
        status: data.status,
        notes: data.notes || undefined,
      };

      const result = await expenseService.createIncome(userId, incomeData);
      
      if (result) {
        form.reset();
        onIncomeCreated();
      }
    } catch (error) {
      console.error('Error creating income:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Income</DialogTitle>
          <DialogDescription>
            Record a new income transaction to track your earnings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter income description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Income Type */}
              <FormField
                control={form.control}
                name="income_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select income type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Income</SelectItem>
                        <SelectItem value="recurring">Recurring Income</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            No categories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Income Source */}
              <FormField
                control={form.control}
                name="income_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Source</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Company Name, Client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Method */}
              <FormField
                control={form.control}
                name="payment_method_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.length > 0 ? (
                          paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-methods" disabled>
                            No payment methods available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bank Account */}
              <FormField
                control={form.control}
                name="bank_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bankAccounts.length > 0 ? (
                          bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.account_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-accounts" disabled>
                            No bank accounts available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Income
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
