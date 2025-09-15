"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// =============================================
// SKELETON SCREEN COMPONENTS
// =============================================
// Reusable skeleton components for loading states

// Basic skeleton components
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`corporate-shadow ${className}`}>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5, className = "" }: { rows?: number; className?: string }) {
  return (
    <Card className={`corporate-shadow ${className}`}>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <Card className={`corporate-shadow ${className}`}>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-full flex items-end justify-center space-x-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-8 bg-[#cce0ff]" 
                style={{ height: `${Math.random() * 200 + 50}px` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonPieChart({ className = "" }: { className?: string }) {
  return (
    <Card className={`corporate-shadow ${className}`}>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full bg-[#cce0ff]" />
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// DASHBOARD SKELETON SCREENS
// =============================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="corporate-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonPieChart />
        <SkeletonChart />
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonTable rows={5} />
        <SkeletonTable rows={5} />
      </div>

      {/* Credit Cards Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="corporate-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-2 w-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
// ANALYTICS SKELETON SCREENS
// =============================================

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters Section */}
      <Card className="corporate-shadow">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Sections */}
      <div className="space-y-8">
        {/* Section 1: Expense/Income Breakdown */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonPieChart />
            <SkeletonChart />
          </div>
        </div>

        {/* Section 2: Transaction Trends */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonTable rows={6} />
          </div>
        </div>

        {/* Section 3: Credit Card & Bank Usage */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-52" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>

        {/* Section 4: Recurring Payments & Installments */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-56" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonTable rows={4} />
            <SkeletonTable rows={4} />
          </div>
        </div>

        {/* Section 5: Budget vs Actuals */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-44" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonTable rows={5} />
            <SkeletonChart />
          </div>
        </div>

        {/* Section 6: Category Insights */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonPieChart />
            <SkeletonChart />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// NAVIGATION SKELETON
// =============================================

export function NavigationSkeleton() {
  return (
    <div className="space-y-4">
      {/* Navigation groups */}
      {Array.from({ length: 4 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          <Skeleton className="h-4 w-20 ml-2" />
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================
// LOADING OVERLAY
// =============================================

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg flex items-center gap-4">
        <div className="h-6 w-6 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#003366] font-medium">{message}</span>
      </div>
    </div>
  );
}
