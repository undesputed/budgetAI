"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const CORPORATE_COLORS = {
  expenses: "#dc2626", // Red for expenses
  transactions: "#007acc", // Blue for transactions
  transfers: "#059669", // Green for transfers
  budget: "#7c3aed", // Purple for budget
};

export default function LineChartClient({ title, description, data, className = "" }: LineChartProps) {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Expenses',
        data: data.map(item => item.expenses),
        borderColor: CORPORATE_COLORS.expenses,
        backgroundColor: CORPORATE_COLORS.expenses + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Transactions',
        data: data.map(item => item.transactions),
        borderColor: CORPORATE_COLORS.transactions,
        backgroundColor: CORPORATE_COLORS.transactions + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Transfers',
        data: data.map(item => item.transfers),
        borderColor: CORPORATE_COLORS.transfers,
        backgroundColor: CORPORATE_COLORS.transfers + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Budget',
        data: data.map(item => item.budget),
        borderColor: CORPORATE_COLORS.budget,
        backgroundColor: CORPORATE_COLORS.budget + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: '#e2e8f0',
          drawBorder: false,
        },
        ticks: {
          color: '#00509e',
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
      },
      y: {
        grid: {
          color: '#e2e8f0',
          drawBorder: false,
        },
        ticks: {
          color: '#00509e',
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          callback: function(value: any) {
            return `$${value.toLocaleString()}`;
          }
        },
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
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
