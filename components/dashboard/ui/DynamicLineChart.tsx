"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineChartData {
  month: string;
  expenses: number;
  transactions: number;
  transfers: number;
  budget: number;
}

interface LineChartProps {
  title: string;
  description?: string;
  data: LineChartData[];
  className?: string;
}

// Dynamically import the LineChart component to avoid SSR issues
const LineChartComponent = dynamic(() => import("./LineChartClient"), {
  ssr: false,
  loading: () => (
    <Card className="corporate-shadow">
      <CardHeader>
        <CardTitle className="text-[#003366]">Loading Chart...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007acc]"></div>
        </div>
      </CardContent>
    </Card>
  ),
});

export function DynamicLineChart({ title, description, data, className = "" }: LineChartProps) {
  return (
    <LineChartComponent
      title={title}
      description={description}
      data={data}
      className={className}
    />
  );
}
