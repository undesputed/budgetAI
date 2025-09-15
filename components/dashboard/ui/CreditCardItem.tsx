"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface CreditCardItemProps {
  cardName: string;
  cardType: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  usagePercentage: number;
  className?: string;
}

export function CreditCardItem({
  cardName,
  cardType,
  lastFourDigits,
  creditLimit,
  currentBalance,
  availableCredit,
  usagePercentage,
  className = "",
}: CreditCardItemProps) {
  const getCardTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "visa":
        return "bg-blue-600";
      case "mastercard":
        return "bg-red-600";
      case "amex":
        return "bg-green-600";
      case "discover":
        return "bg-orange-600";
      default:
        return "bg-gray-600";
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className={`corporate-shadow hover:corporate-shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${getCardTypeColor(cardType)}`}>
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-[#003366]">{cardName}</h4>
              <p className="text-sm text-[#00509e]">
                {cardType.toUpperCase()} •••• {lastFourDigits}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[#003366]">
              ${availableCredit.toLocaleString()}
            </p>
            <p className="text-xs text-[#00509e]">available</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#00509e]">Credit Limit</span>
            <span className="text-[#003366]">${creditLimit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#00509e]">Current Balance</span>
            <span className="text-[#003366]">${currentBalance.toLocaleString()}</span>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#00509e]">Usage</span>
              <span className="text-[#003366]">{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#e2e8f0] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(usagePercentage)}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
