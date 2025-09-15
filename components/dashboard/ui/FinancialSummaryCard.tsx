"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialSummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function FinancialSummaryCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className = "",
}: FinancialSummaryCardProps) {
  return (
    <Card className={`corporate-shadow hover:corporate-shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#00509e]">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#007acc]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#003366]">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {description && (
          <p className="text-xs text-[#00509e] mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-[#00509e] ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
