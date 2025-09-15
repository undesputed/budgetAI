"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/ui/DataTable";
import { AnalyticsTimeline } from "@/components/analytics/charts/AnalyticsTimeline";
import { FullCalendarTimeline } from "@/components/analytics/charts/FullCalendarTimeline";
import { Calendar, CreditCard, Clock, AlertCircle } from "lucide-react";
import type { RecurringPaymentData, InstallmentData } from "@/lib/services/analytics-server";

interface RecurringPaymentsInstallmentsProps {
  recurringPayments: RecurringPaymentData[];
  installments: InstallmentData[];
}

export function RecurringPaymentsInstallments({ 
  recurringPayments, 
  installments 
}: RecurringPaymentsInstallmentsProps) {
  // Prepare recurring payments table
  const recurringPaymentsTable = recurringPayments.map(payment => ({
    type: payment.payment_type,
    amount: payment.amount,
    due: payment.due_day,
    frequency: payment.frequency,
    status: payment.payment_status,
    category: payment.category_name,
    autoPay: payment.auto_pay ? 'Yes' : 'No'
  }));

  const recurringColumns = [
    { key: "type", label: "Payment Type" },
    { key: "amount", label: "Amount", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "due", label: "Due Day" },
    { key: "frequency", label: "Frequency" },
    { key: "status", label: "Status", render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'overdue' ? 'bg-red-100 text-red-800' :
        value === 'due_today' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {value.replace('_', ' ').toUpperCase()}
      </span>
    )},
    { key: "category", label: "Category" },
    { key: "autoPay", label: "Auto Pay" }
  ];

  // Prepare installments table
  const installmentsTable = installments.map(installment => ({
    item: installment.item_name,
    total: installment.total_amount,
    remaining: installment.remaining_amount,
    monthly: installment.monthly_payment,
    progress: `${installment.paid_installments}/${installment.total_installments}`,
    completion: installment.completion_percentage,
    status: installment.payment_status
  }));

  const installmentColumns = [
    { key: "item", label: "Item" },
    { key: "total", label: "Total", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "remaining", label: "Remaining", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "monthly", label: "Monthly", render: (value: number) => `$${value.toFixed(2)}` },
    { key: "progress", label: "Progress" },
    { key: "completion", label: "Complete %", render: (value: number) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value >= 80 ? 'bg-green-100 text-green-800' :
        value >= 50 ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {value.toFixed(1)}%
      </span>
    )},
    { key: "status", label: "Status", render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'overdue' ? 'bg-red-100 text-red-800' :
        value === 'due_today' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {value.replace('_', ' ').toUpperCase()}
      </span>
    )}
  ];

  // Calculate totals
  const totalRecurringAmount = recurringPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInstallmentRemaining = installments.reduce((sum, installment) => sum + installment.remaining_amount, 0);
  const totalMonthlyPayments = installments.reduce((sum, installment) => sum + installment.monthly_payment, 0);
  const overduePayments = recurringPayments.filter(payment => payment.payment_status === 'overdue').length;
  const overdueInstallments = installments.filter(installment => installment.payment_status === 'overdue').length;

  // Upcoming payments (next 5)
  const upcomingPayments = recurringPayments
    .filter(payment => payment.payment_status === 'upcoming')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Recurring Payments & Installments</h2>
          <p className="text-[#00509e]">Track commitments and future outflows</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Monthly Recurring</div>
            <div className="text-lg font-semibold text-[#003366]">${totalRecurringAmount.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Installment Remaining</div>
            <div className="text-lg font-semibold text-orange-600">${totalInstallmentRemaining.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#00509e]">Monthly Installments</div>
            <div className="text-lg font-semibold text-blue-600">${totalMonthlyPayments.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Overdue Alerts */}
      {(overduePayments > 0 || overdueInstallments > 0) && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-semibold text-red-800">Overdue Payments Alert</div>
                <div className="text-sm text-red-600">
                  {overduePayments} recurring payment{overduePayments !== 1 ? 's' : ''} and {overdueInstallments} installment{overdueInstallments !== 1 ? 's' : ''} are overdue
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Payments Table */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Recurring Payments
            </CardTitle>
            <p className="text-sm text-[#00509e]">Monthly obligations and subscriptions</p>
          </CardHeader>
          <CardContent>
            {recurringPaymentsTable.length > 0 ? (
              <DataTable
                title=""
                columns={recurringColumns}
                data={recurringPaymentsTable}
                maxRows={5}
                onViewAll={() => console.log('View all recurring payments')}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-[#00509e]">
                No recurring payments found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Installments Table */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Installment Plans
            </CardTitle>
            <p className="text-sm text-[#00509e]">Active installment plans and progress</p>
          </CardHeader>
          <CardContent>
            {installmentsTable.length > 0 ? (
              <DataTable
                title=""
                columns={installmentColumns}
                data={installmentsTable}
                maxRows={5}
                onViewAll={() => console.log('View all installments')}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-[#00509e]">
                No installments found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simple Timeline */}
        <AnalyticsTimeline 
          recurringPayments={recurringPayments}
          installments={installments}
        />

        {/* Full Calendar Timeline */}
        <FullCalendarTimeline 
          recurringPayments={recurringPayments}
          installments={installments}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Recurring</div>
                <div className="text-lg font-bold text-blue-800">${totalRecurringAmount.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">Active Installments</div>
                <div className="text-lg font-bold text-green-800">{installments.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-orange-600 font-medium">Monthly Installments</div>
                <div className="text-lg font-bold text-orange-800">${totalMonthlyPayments.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-red-600 font-medium">Overdue Items</div>
                <div className="text-lg font-bold text-red-800">{overduePayments + overdueInstallments}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
