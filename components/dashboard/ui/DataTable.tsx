"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  description?: string;
  columns: TableColumn[];
  data: any[];
  maxRows?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export function DataTable({
  title,
  description,
  columns,
  data,
  maxRows = 5,
  showViewAll = true,
  onViewAll,
  className = "",
}: DataTableProps) {
  const displayData = maxRows ? data.slice(0, maxRows) : data;
  const hasMoreData = data.length > maxRows;

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
        <div className="space-y-3">
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-[#00509e]">
              <p>No data available</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {displayData.map((row, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]"
                  >
                    {columns.map((column) => (
                      <div key={column.key} className="flex-1">
                        {column.render ? (
                          column.render(row[column.key], row)
                        ) : (
                          <span className="text-sm text-[#003366]">
                            {row[column.key]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              {hasMoreData && showViewAll && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onViewAll}
                    className="w-full border-[#e2e8f0] text-[#003366] hover:bg-[#f8fafc]"
                  >
                    View All ({data.length} items)
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
