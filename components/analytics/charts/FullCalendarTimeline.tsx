"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Settings } from "lucide-react";
import type { RecurringPaymentData, InstallmentData } from "@/lib/services/analytics-server";

interface FullCalendarTimelineProps {
  recurringPayments: RecurringPaymentData[];
  installments: InstallmentData[];
}

export function FullCalendarTimeline({ recurringPayments, installments }: FullCalendarTimelineProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import FullCalendar to avoid SSR issues
    const loadFullCalendar = async () => {
      try {
        const { Calendar } = await import('@fullcalendar/core');
        const dayGridPlugin = await import('@fullcalendar/daygrid');
        const timeGridPlugin = await import('@fullcalendar/timegrid');
        const interactionPlugin = await import('@fullcalendar/interaction');

        if (calendarRef.current) {
          const calendar = new Calendar(calendarRef.current, {
            plugins: [dayGridPlugin.default, timeGridPlugin.default, interactionPlugin.default],
            initialView: 'dayGridMonth',
            headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: generateCalendarEvents(),
            eventColor: '#007acc',
            eventTextColor: '#ffffff',
            height: 'auto',
            aspectRatio: 1.8,
            dayMaxEvents: 3,
            moreLinkClick: 'popover',
            eventClick: (info) => {
              console.log('Event clicked:', info.event);
            }
          });

          calendar.render();
        }
      } catch (error) {
        console.error('Error loading FullCalendar:', error);
      }
    };

    loadFullCalendar();
  }, [recurringPayments, installments]);

  const generateCalendarEvents = () => {
    const events: any[] = [];

    // Add recurring payment events for the next 3 months
    recurringPayments.forEach(payment => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      let currentDate = new Date(startDate);
      currentDate.setDate(payment.due_day);

      while (currentDate <= endDate) {
        events.push({
          id: `recurring-${payment.payment_id}-${currentDate.toISOString().split('T')[0]}`,
          title: `${payment.payment_type} - $${payment.amount.toFixed(2)}`,
          start: currentDate.toISOString().split('T')[0],
          backgroundColor: payment.category_color || '#007acc',
          borderColor: payment.category_color || '#007acc',
          extendedProps: {
            type: 'recurring',
            amount: payment.amount,
            category: payment.category_name,
            status: payment.payment_status
          }
        });

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(payment.due_day);
      }
    });

    // Add installment events
    installments.forEach(installment => {
      events.push({
        id: `installment-${installment.installment_id}`,
        title: `${installment.item_name} - $${installment.monthly_payment.toFixed(2)}`,
        start: installment.due_date,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        extendedProps: {
          type: 'installment',
          amount: installment.monthly_payment,
          remaining: installment.remaining_amount,
          progress: installment.completion_percentage
        }
      });
    });

    return events;
  };

  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Payment Calendar
        </CardTitle>
        <p className="text-sm text-[#00509e]">Visual timeline of all payments and installments</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#007acc' }} />
              <span className="text-[#00509e]">Recurring Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
              <span className="text-[#00509e]">Installments</span>
            </div>
          </div>

          {/* Calendar Container */}
          <div ref={calendarRef} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
