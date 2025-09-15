"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Check,
  X
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PaymentMethod } from "@/lib/services/expense-service-client";
import { createExpenseServiceClient } from "@/lib/services/expense-service-client";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethods: PaymentMethod[];
  onPaymentMethodsUpdated: (methods: PaymentMethod[]) => void;
  userId: string;
}

interface SortablePaymentMethodItemProps {
  method: PaymentMethod;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (methodId: string) => void;
}

function SortablePaymentMethodItem({ method, onEdit, onDelete }: SortablePaymentMethodItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: method.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'bank_account': return 'bg-blue-100 text-blue-800';
      case 'credit_card': return 'bg-purple-100 text-purple-800';
      case 'e_wallet': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{method.name}</h4>
          <Badge className={getTypeColor(method.type)}>
            {method.type.replace('_', ' ')}
          </Badge>
          {!method.is_active && (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
        {method.description && (
          <p className="text-sm text-gray-600 mt-1">{method.description}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(method)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(method.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  paymentMethods,
  onPaymentMethodsUpdated,
  userId
}: PaymentMethodDialogProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(paymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank_account' | 'credit_card' | 'e_wallet' | 'other',
    description: '',
    is_active: true,
    sort_order: 0
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMethods(paymentMethods);
  }, [paymentMethods]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = methods.findIndex(method => method.id === active.id);
      const newIndex = methods.findIndex(method => method.id === over.id);
      
      const newMethods = arrayMove(methods, oldIndex, newIndex);
      setMethods(newMethods);
      
      // Update sort orders in database
      const expenseService = createExpenseServiceClient();
      for (let i = 0; i < newMethods.length; i++) {
        await expenseService.updatePaymentMethod(newMethods[i].id, {
          sort_order: i
        });
      }
      
      onPaymentMethodsUpdated(newMethods);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    setLoading(true);
    try {
      const expenseService = createExpenseServiceClient();
      
      if (editingMethod) {
        // Update existing method
        const updated = await expenseService.updatePaymentMethod(editingMethod.id, formData);
        if (updated) {
          const newMethods = methods.map(m => m.id === editingMethod.id ? updated : m);
          setMethods(newMethods);
          onPaymentMethodsUpdated(newMethods);
        }
      } else {
        // Create new method
        const newMethod = await expenseService.createPaymentMethod(userId, {
          ...formData,
          sort_order: methods.length
        });
        if (newMethod) {
          const newMethods = [...methods, newMethod];
          setMethods(newMethods);
          onPaymentMethodsUpdated(newMethods);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      description: method.description || '',
      is_active: method.is_active,
      sort_order: method.sort_order
    });
    setShowAddForm(true);
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    
    setLoading(true);
    try {
      const expenseService = createExpenseServiceClient();
      const success = await expenseService.deletePaymentMethod(methodId);
      
      if (success) {
        const newMethods = methods.filter(m => m.id !== methodId);
        setMethods(newMethods);
        onPaymentMethodsUpdated(newMethods);
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaults = async () => {
    setLoading(true);
    try {
      const expenseService = createExpenseServiceClient();
      
      const defaultMethods = [
        { name: 'Cash', type: 'cash', description: 'Physical cash payments', sort_order: 0 },
        { name: 'Debit Card', type: 'bank_account', description: 'Primary debit card', sort_order: 1 },
        { name: 'Credit Card', type: 'credit_card', description: 'Primary credit card', sort_order: 2 },
        { name: 'Bank Transfer', type: 'bank_account', description: 'Bank transfer payments', sort_order: 3 },
        { name: 'Digital Wallet', type: 'e_wallet', description: 'Digital wallet payments', sort_order: 4 }
      ];

      const newMethods = [];
      for (const method of defaultMethods) {
        const created = await expenseService.createPaymentMethod(userId, method);
        if (created) {
          newMethods.push(created);
        }
      }
      
      const updatedMethods = [...methods, ...newMethods];
      setMethods(updatedMethods);
      onPaymentMethodsUpdated(updatedMethods);
    } catch (error) {
      console.error('Error creating default payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'cash',
      description: '',
      is_active: true,
      sort_order: 0
    });
    setEditingMethod(null);
    setShowAddForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </DialogTitle>
          <DialogDescription>
            Manage your payment methods for expense tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Empty state with default creation */}
          {methods.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first payment method or start with some common ones.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
                <Button variant="outline" onClick={handleCreateDefaults}>
                  Create Sample Methods
                </Button>
              </div>
            </div>
          )}

          {/* Payment methods list */}
          {methods.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Your Payment Methods</h3>
                <Button onClick={() => setShowAddForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={methods.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {methods.map((method) => (
                    <SortablePaymentMethodItem
                      key={method.id}
                      method={method}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Add/Edit form */}
          {showAddForm && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="method-name">Name *</Label>
                    <Input
                      id="method-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., My Credit Card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method-type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_account">Bank Account</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="e_wallet">Digital Wallet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="method-description">Description</Label>
                  <Textarea
                    id="method-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="method-active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="method-active">Active</Label>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
                  {loading ? 'Saving...' : (editingMethod ? 'Update' : 'Create')}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
