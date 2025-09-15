"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

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

const CORPORATE_COLORS = [
  "#003366", // Deep Blue
  "#00509e", // Medium Blue
  "#007acc", // Bright Blue
  "#66a3ff", // Light Blue
  "#cce0ff", // Very Light Blue
  "#1e40af", // Indigo
  "#3b82f6", // Blue
  "#60a5fa", // Light Blue
];

export default function PieChartClient({ title, description, data, className = "" }: PieChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => item.color || CORPORATE_COLORS[index % CORPORATE_COLORS.length]),
        borderColor: data.map((item, index) => item.color || CORPORATE_COLORS[index % CORPORATE_COLORS.length]),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          color: '#003366',
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#003366',
        bodyColor: '#00509e',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <Card className={`corporate-shadow ${className}`}>
      <CardHeader>
        <CardTitle className="text-[#003366]">{title}</CardTitle>
        {description && (
          <CardDescription className="text-[#00509e]">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Pie data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
