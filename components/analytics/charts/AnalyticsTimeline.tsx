"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import type { RecurringPaymentData, InstallmentData } from "@/lib/services/analytics-server";

interface AnalyticsTimelineProps {
  recurringPayments: RecurringPaymentData[];
  installments: InstallmentData[];
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'recurring' | 'installment';
  status: 'overdue' | 'due_today' | 'upcoming';
  category?: string;
  color: string;
}

export function AnalyticsTimeline({ recurringPayments, installments }: AnalyticsTimelineProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  // Convert data to timeline events
  const timelineEvents: TimelineEvent[] = [
    ...recurringPayments.map(payment => ({
      id: `recurring-${payment.payment_id}`,
      title: payment.payment_type,
      date: getNextDueDate(payment.due_day),
      amount: payment.amount,
      type: 'recurring' as const,
      status: payment.payment_status,
      category: payment.category_name,
      color: payment.category_color || '#007acc'
    })),
    ...installments.map(installment => ({
      id: `installment-${installment.installment_id}`,
      title: installment.item_name,
      date: installment.due_date,
      amount: installment.monthly_payment,
      type: 'installment' as const,
      status: installment.payment_status,
      color: '#10b981'
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get next 30 days of events
  const upcomingEvents = timelineEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return eventDate >= today && eventDate <= thirtyDaysFromNow;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'due_today':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Calendar className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'border-red-200 bg-red-50';
      case 'due_today':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-green-200 bg-green-50';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-800';
      case 'due_today':
        return 'text-yellow-800';
      default:
        return 'text-green-800';
    }
  };

  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Payment Timeline
        </CardTitle>
        <p className="text-sm text-[#00509e]">Next 30 days of payments and installments</p>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border ${getStatusColor(event.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(event.status)}
                    <div>
                      <div className="font-medium text-[#003366]">{event.title}</div>
                      <div className="text-sm text-[#00509e]">
                        {event.type === 'recurring' ? 'Recurring Payment' : 'Installment'}
                        {event.category && ` • ${event.category}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#003366]">${event.amount.toFixed(2)}</div>
                    <div className="text-sm text-[#00509e]">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-[#00509e]">
            No upcoming payments in the next 30 days
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get next due date for recurring payments
function getNextDueDate(dueDay: number): string {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Create date for this month's due day
  let dueDate = new Date(currentYear, currentMonth, dueDay);
  
  // If the due day has passed this month, move to next month
  if (dueDate < today) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay);
  }
  
  return dueDate.toISOString().split('T')[0];
}
