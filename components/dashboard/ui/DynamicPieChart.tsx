"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  title: string;
  description?: string;
  data: PieChartData[];
  className?: string;
}

// Dynamically import the PieChart component to avoid SSR issues
const PieChartComponent = dynamic(() => import("./PieChartClient"), {
  ssr: false,
  loading: () => (
    <Card className="corporate-shadow">
      <CardHeader>
        <CardTitle className="text-[#003366]">Loading Chart...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007acc]"></div>
        </div>
      </CardContent>
    </Card>
  ),
});

export function DynamicPieChart({ title, description, data, className = "" }: PieChartProps) {
  return (
    <PieChartComponent
      title={title}
      description={description}
      data={data}
      className={className}
    />
  );
}
