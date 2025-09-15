"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  Calendar, 
  CreditCard, 
  RotateCcw,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import { PaymentNotification } from "@/lib/services/expense-service-client";
import { createExpenseServiceClient } from "@/lib/services/expense-service-client";

interface PaymentNotificationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: PaymentNotification[];
  userId: string;
}

export function PaymentNotifications({
  open,
  onOpenChange,
  notifications,
  userId
}: PaymentNotificationsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'credit_card_due':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'installment_due':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'recurring_due':
        return <RotateCcw className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card_due':
        return 'Credit Card Payment Due';
      case 'installment_due':
        return 'Installment Payment Due';
      case 'recurring_due':
        return 'Recurring Payment Due';
      default:
        return 'Payment Due';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setLoading(notificationId);
    try {
      const expenseService = createExpenseServiceClient();
      await expenseService.markNotificationAsRead(notificationId);
      // Refresh notifications or update state
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    setLoading(notificationId);
    try {
      const expenseService = createExpenseServiceClient();
      await expenseService.dismissNotification(notificationId);
      // Refresh notifications or update state
    } catch (error) {
      console.error('Error dismissing notification:', error);
    } finally {
      setLoading(null);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const overdueNotifications = notifications.filter(n => isOverdue(n.due_date));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Notifications
          </DialogTitle>
          <DialogDescription>
            Manage your payment reminders and due dates.
          </DialogDescription>
        </DialogHeader>

        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              You're all caught up! No payment notifications at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Unread</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{unreadNotifications.length}</p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Overdue</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900">{overdueNotifications.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${
                    notification.is_read 
                      ? 'opacity-60' 
                      : isOverdue(notification.due_date) 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getNotificationIcon(notification.type)}
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              New
                            </Badge>
                          )}
                          {isOverdue(notification.due_date) && (
                            <Badge variant="destructive">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {formatDate(notification.due_date)}
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(notification.amount)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={loading === notification.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismiss(notification.id)}
                          disabled={loading === notification.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
