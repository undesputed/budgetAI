"use client";

import { useState } from "react";
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
          newExpense = await expenseService.createCreditCardPayment(userId, {
            ...creditCardData,
            date: creditCardData.date.toISOString().split('T')[0],
            amount: parseFloat(creditCardData.amount)
          });
          break;
        case 'installment':
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
      }
    } catch (error) {
      console.error('Error creating expense:', error);
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
                        <SelectItem value="food">Food & Dining</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                        <SelectItem value="card1">Visa ****1234</SelectItem>
                        <SelectItem value="card2">Mastercard ****5678</SelectItem>
                      </SelectContent>
                    </Select>
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
                      onValueChange={(value) => setInstallmentData(prev => ({ ...prev, installment_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select installment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="installment1">Laptop - 3/12 payments</SelectItem>
                        <SelectItem value="installment2">Phone - 1/24 payments</SelectItem>
                      </SelectContent>
                    </Select>
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
