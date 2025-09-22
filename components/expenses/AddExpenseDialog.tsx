"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Calendar, 
  RotateCcw, 
  ShoppingCart,
  Upload,
  X
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { PaymentMethod, ExpenseTransaction } from "@/lib/services/expense-service-client";
import { createExpenseServiceClient } from "@/lib/services/expense-service-client";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: (expense: ExpenseTransaction) => void;
  paymentMethods: PaymentMethod[];
  userId: string;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onExpenseAdded,
  paymentMethods,
  userId
}: AddExpenseDialogProps) {
  const [activeTab, setActiveTab] = useState("expense");
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch credit cards, bank accounts, installments, and categories when dialog opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const expenseService = createExpenseServiceClient();
        
        // First, try to get categories
        let categoriesData = await expenseService.getCategories(userId);
        
        // If no categories exist, create default ones
        if (categoriesData.length === 0) {
          const created = await expenseService.createDefaultCategories(userId);
          if (created) {
            categoriesData = await expenseService.getCategories(userId);
          }
        }
        
        const [cards, accounts, installmentsData] = await Promise.all([
          expenseService.getCreditCards(userId),
          expenseService.getBankAccounts(userId),
          expenseService.getInstallments(userId)
        ]);
        
        setCreditCards(cards);
        setBankAccounts(accounts);
        setInstallments(installmentsData);
        setCategories(categoriesData);
      };
      fetchData();
    }
  }, [open, userId]);
  
  // Form states
  const [expenseData, setExpenseData] = useState({
    date: new Date(),
    description: '',
    amount: '',
    category_id: '',
    payment_method_id: '',
    status: 'completed' as const,
    notes: ''
  });

  const [creditCardData, setCreditCardData] = useState({
    credit_card_id: '',
    amount: '',
    date: new Date(),
    payment_method_id: '',
    notes: ''
  });

  const [installmentData, setInstallmentData] = useState({
    installment_id: '',
    amount: '',
    date: new Date(),
    payment_method_id: '',
    notes: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const expenseService = createExpenseServiceClient();
      let newExpense: ExpenseTransaction | null = null;

      switch (activeTab) {
        case 'expense':
          newExpense = await expenseService.createExpense(userId, {
            ...expenseData,
            date: expenseData.date.toISOString().split('T')[0],
            amount: parseFloat(expenseData.amount)
          });
          break;
        case 'credit-card':
          // Validate credit card payment amount
          const selectedCard = creditCards.find(c => c.id === creditCardData.credit_card_id);
          if (selectedCard) {
            const availableCredit = selectedCard.credit_limit - selectedCard.current_balance;
            const paymentAmount = parseFloat(creditCardData.amount);
            
            if (paymentAmount > availableCredit) {
              alert(`Payment amount ($${paymentAmount.toLocaleString()}) exceeds available credit ($${availableCredit.toLocaleString()})`);
              setLoading(false);
              return;
            }
          }
          
          newExpense = await expenseService.createCreditCardPayment(userId, {
            ...creditCardData,
            date: creditCardData.date.toISOString().split('T')[0],
            amount: parseFloat(creditCardData.amount)
          });
          break;
        case 'installment':
          // Validate installment payment
          const selectedInstallment = installments.find(i => i.id === installmentData.installment_id);
          if (selectedInstallment) {
            const paymentAmount = parseFloat(installmentData.amount);
            const expectedAmount = selectedInstallment.monthly_payment;
            const remainingAmount = selectedInstallment.remaining_amount;
            
            // Check if installment is already completed
            if (selectedInstallment.paid_installments >= selectedInstallment.total_installments) {
              alert('This installment plan is already completed!');
              setLoading(false);
              return;
            }
            
            // Warn if payment amount doesn't match expected amount (but allow it)
            if (Math.abs(paymentAmount - expectedAmount) > 0.01) {
              const proceed = confirm(
                `Expected payment: $${expectedAmount.toLocaleString()}\n` +
                `Your payment: $${paymentAmount.toLocaleString()}\n\n` +
                `Do you want to proceed with this amount?`
              );
              if (!proceed) {
                setLoading(false);
                return;
              }
            }
            
            // Check if payment exceeds remaining amount
            if (paymentAmount > remainingAmount) {
              alert(`Payment amount ($${paymentAmount.toLocaleString()}) exceeds remaining balance ($${remainingAmount.toLocaleString()})`);
              setLoading(false);
              return;
            }
          }
          
          newExpense = await expenseService.createInstallmentPayment(userId, {
            ...installmentData,
            date: installmentData.date.toISOString().split('T')[0],
            amount: parseFloat(installmentData.amount)
          });
          break;
      }

      if (newExpense) {
        onExpenseAdded(newExpense);
        handleClose();
      } else {
        alert('Failed to create expense. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('An error occurred while creating the expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setExpenseData({
      date: new Date(),
      description: '',
      amount: '',
      category_id: '',
      payment_method_id: '',
      status: 'completed',
      notes: ''
    });
    setCreditCardData({
      credit_card_id: '',
      amount: '',
      date: new Date(),
      payment_method_id: '',
      notes: ''
    });
    setInstallmentData({
      installment_id: '',
      amount: '',
      date: new Date(),
      payment_method_id: '',
      notes: ''
    });
    setReceiptFile(null);
    onOpenChange(false);
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Choose the type of expense you want to add and fill in the details.
          </DialogDescription>
        </DialogHeader>
        

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Expense
            </TabsTrigger>
            <TabsTrigger value="credit-card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit Card Payment
            </TabsTrigger>
            <TabsTrigger value="installment" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Installment Payment
            </TabsTrigger>
          </TabsList>

          {/* General Expense Tab */}
          <TabsContent value="expense" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  General Expense
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-date">Date</Label>
                    <DatePicker
                      value={expenseData.date}
                      onChange={(date) => setExpenseData(prev => ({ ...prev, date: date || new Date() }))}
                      placeholder="Select date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">Amount</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={expenseData.amount}
                      onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-description">Description</Label>
                  <Input
                    id="expense-description"
                    placeholder="What did you spend on?"
                    value={expenseData.description}
                    onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-category">Category</Label>
                    <Select
                      value={expenseData.category_id}
                      onValueChange={(value) => setExpenseData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-payment-method">Payment Method</Label>
                    <Select
                      value={expenseData.payment_method_id}
                      onValueChange={(value) => setExpenseData(prev => ({ ...prev, payment_method_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-notes">Notes (Optional)</Label>
                  <Textarea
                    id="expense-notes"
                    placeholder="Additional notes..."
                    value={expenseData.notes}
                    onChange={(e) => setExpenseData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit Card Payment Tab */}
          <TabsContent value="credit-card" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Credit Card Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cc-date">Payment Date</Label>
                    <DatePicker
                      value={creditCardData.date}
                      onChange={(date) => setCreditCardData(prev => ({ ...prev, date: date || new Date() }))}
                      placeholder="Select payment date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc-amount">Payment Amount</Label>
                    <Input
                      id="cc-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={creditCardData.amount}
                      onChange={(e) => setCreditCardData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cc-card">Credit Card</Label>
                    <Select
                      value={creditCardData.credit_card_id}
                      onValueChange={(value) => setCreditCardData(prev => ({ ...prev, credit_card_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit card" />
                      </SelectTrigger>
                      <SelectContent>
                        {creditCards.length > 0 ? (
                          creditCards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{card.card_name} ****{card.last_four_digits}</span>
                                <div className="text-xs text-gray-500 ml-2">
                                  ${card.current_balance.toLocaleString()} / ${card.credit_limit.toLocaleString()}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-cards" disabled>
                            No credit cards available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {creditCardData.credit_card_id && (
                      <div className="text-xs text-gray-600">
                        {(() => {
                          const selectedCard = creditCards.find(c => c.id === creditCardData.credit_card_id);
                          if (selectedCard) {
                            const availableCredit = selectedCard.credit_limit - selectedCard.current_balance;
                            return `Available Credit: $${availableCredit.toLocaleString()}`;
                          }
                          return '';
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc-payment-method">Payment Method</Label>
                    <Select
                      value={creditCardData.payment_method_id}
                      onValueChange={(value) => setCreditCardData(prev => ({ ...prev, payment_method_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How did you pay?" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cc-notes">Notes (Optional)</Label>
                  <Textarea
                    id="cc-notes"
                    placeholder="Additional notes..."
                    value={creditCardData.notes}
                    onChange={(e) => setCreditCardData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installment Payment Tab */}
          <TabsContent value="installment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Installment Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installment-date">Payment Date</Label>
                    <DatePicker
                      value={installmentData.date}
                      onChange={(date) => setInstallmentData(prev => ({ ...prev, date: date || new Date() }))}
                      placeholder="Select payment date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installment-amount">Payment Amount</Label>
                    <Input
                      id="installment-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={installmentData.amount}
                      onChange={(e) => setInstallmentData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installment-item">Installment Item</Label>
                    <Select
                      value={installmentData.installment_id}
                      onValueChange={(value) => {
                        const selectedInstallment = installments.find(i => i.id === value);
                        setInstallmentData(prev => ({ 
                          ...prev, 
                          installment_id: value,
                          // Auto-fill with expected monthly payment
                          amount: selectedInstallment ? selectedInstallment.monthly_payment.toString() : prev.amount
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select installment" />
                      </SelectTrigger>
                      <SelectContent>
                        {installments.length > 0 ? (
                          installments.map((installment) => {
                            const isCompleted = installment.paid_installments >= installment.total_installments;
                            const progressPercentage = (installment.paid_installments / installment.total_installments) * 100;
                            
                            return (
                              <SelectItem 
                                key={installment.id} 
                                value={installment.id}
                                disabled={isCompleted}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex flex-col">
                                    <span className={isCompleted ? "line-through text-gray-500" : ""}>
                                      {installment.item_name}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                      {installment.paid_installments}/{installment.total_installments} payments
                                      {isCompleted && " (Completed)"}
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 ml-2">
                                    ${installment.monthly_payment.toLocaleString()}/mo
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })
                        ) : (
                          <SelectItem value="no-installments" disabled>
                            No installments available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {installmentData.installment_id && (
                      <div className="space-y-2">
                        {(() => {
                          const selectedInstallment = installments.find(i => i.id === installmentData.installment_id);
                          if (selectedInstallment) {
                            const isCompleted = selectedInstallment.paid_installments >= selectedInstallment.total_installments;
                            const progressPercentage = (selectedInstallment.paid_installments / selectedInstallment.total_installments) * 100;
                            const nextPaymentNumber = selectedInstallment.paid_installments + 1;
                            
                            return (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress: {selectedInstallment.paid_installments}/{selectedInstallment.total_installments} payments</span>
                                  <span>{progressPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                  ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Remaining:</span>
                                    <span className="ml-1 font-medium">${selectedInstallment.remaining_amount.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Monthly:</span>
                                    <span className="ml-1 font-medium">${selectedInstallment.monthly_payment.toLocaleString()}</span>
                                  </div>
                                </div>
                                {!isCompleted && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    Next Payment: #{nextPaymentNumber} - ${selectedInstallment.monthly_payment.toLocaleString()}
                                  </div>
                                )}
                                {isCompleted && (
                                  <div className="text-xs text-green-600 font-medium">
                                    ✅ Installment plan completed!
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return '';
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installment-payment-method">Payment Method</Label>
                    <Select
                      value={installmentData.payment_method_id}
                      onValueChange={(value) => setInstallmentData(prev => ({ ...prev, payment_method_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How did you pay?" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installment-notes">Notes (Optional)</Label>
                  <Textarea
                    id="installment-notes"
                    placeholder="Additional notes..."
                    value={installmentData.notes}
                    onChange={(e) => setInstallmentData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Receipt Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Receipt (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receiptFile ? (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{receiptFile.name}</Badge>
                  <span className="text-sm text-gray-500">
                    {(receiptFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeReceipt}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">Upload receipt image</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#007acc] hover:bg-[#00509e]"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
