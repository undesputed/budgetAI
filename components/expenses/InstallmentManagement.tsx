"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  TrendingUp
} from "lucide-react";
import { createExpenseServiceClient } from "@/lib/services/expense-service-client";

interface InstallmentManagementProps {
  userId: string;
}

interface Installment {
  id: string;
  item_name: string;
  total_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  total_installments: number;
  paid_installments: number;
  due_date: string;
  interest_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function InstallmentManagement({ userId }: InstallmentManagementProps) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstallments();
  }, [userId]);

  const fetchInstallments = async () => {
    try {
      const expenseService = createExpenseServiceClient();
      const data = await expenseService.getInstallments(userId);
      setInstallments(data);
    } catch (error) {
      console.error('Error fetching installments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (installment: Installment) => {
    const isCompleted = installment.paid_installments >= installment.total_installments;
    const progressPercentage = (installment.paid_installments / installment.total_installments) * 100;
    const dueDate = new Date(installment.due_date);
    const today = new Date();
    const isOverdue = dueDate < today && !isCompleted;
    const isDueToday = dueDate.toDateString() === today.toDateString() && !isCompleted;

    let status = 'upcoming';
    let statusColor = 'bg-blue-100 text-blue-800';
    let statusIcon = <Clock className="h-4 w-4" />;

    if (isCompleted) {
      status = 'completed';
      statusColor = 'bg-green-100 text-green-800';
      statusIcon = <CheckCircle className="h-4 w-4" />;
    } else if (isOverdue) {
      status = 'overdue';
      statusColor = 'bg-red-100 text-red-800';
      statusIcon = <AlertCircle className="h-4 w-4" />;
    } else if (isDueToday) {
      status = 'due_today';
      statusColor = 'bg-orange-100 text-orange-800';
      statusIcon = <AlertCircle className="h-4 w-4" />;
    }

    return { status, statusColor, statusIcon, progressPercentage, isCompleted };
  };

  const getTotalMonthlyPayments = () => {
    return installments
      .filter(i => !getStatusInfo(i).isCompleted)
      .reduce((sum, i) => sum + i.monthly_payment, 0);
  };

  const getTotalRemaining = () => {
    return installments
      .filter(i => !getStatusInfo(i).isCompleted)
      .reduce((sum, i) => sum + i.remaining_amount, 0);
  };

  if (loading) {
    return (
      <Card className="corporate-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Installment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007acc] mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading installments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="corporate-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Installment Management
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Installment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {installments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No installments yet</h3>
            <p className="text-gray-600 mb-4">
              Track your installment payments and monitor progress.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Installment
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Active Plans</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {installments.filter(i => !getStatusInfo(i).isCompleted).length}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Monthly Payments</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  ${getTotalMonthlyPayments().toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Remaining</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ${getTotalRemaining().toLocaleString()}
                </p>
              </div>
            </div>

            {/* Installment List */}
            <div className="space-y-4">
              <h3 className="font-medium text-[#003366]">Your Installment Plans</h3>
              {installments.map((installment) => {
                const statusInfo = getStatusInfo(installment);
                const nextPaymentNumber = installment.paid_installments + 1;
                
                return (
                  <div
                    key={installment.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-[#003366]">
                            {installment.item_name}
                          </h4>
                          <Badge className={statusInfo.statusColor}>
                            {statusInfo.statusIcon}
                            <span className="ml-1 capitalize">
                              {statusInfo.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {installment.paid_installments}/{installment.total_installments} payments completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#003366]">
                          ${installment.monthly_payment.toLocaleString()}/mo
                        </p>
                        <p className="text-sm text-gray-600">
                          Remaining: ${installment.remaining_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{statusInfo.progressPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={statusInfo.progressPercentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Payment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Amount:</span>
                        <p className="font-medium">${installment.total_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid Amount:</span>
                        <p className="font-medium">
                          ${(installment.total_amount - installment.remaining_amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Payment:</span>
                        <p className="font-medium">
                          {!statusInfo.isCompleted ? `#${nextPaymentNumber}` : 'Completed'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-medium">
                          {new Date(installment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!statusInfo.isCompleted && (
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-[#007acc] hover:bg-[#00509e]">
                            Make Payment
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


