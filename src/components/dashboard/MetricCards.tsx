"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Home, CheckCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, description, trend, icon, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
        {trend && (
          <div className="flex items-center space-x-1 text-xs mt-1">
            <Badge variant={trend.isPositive ? "default" : "destructive"} className="text-xs">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  totalInterns: number;
  activeInterns: number;
  completedProjects: number;
  housingOccupancy: number;
  className?: string;
}

export function DashboardMetrics({
  totalInterns,
  activeInterns,
  completedProjects,
  housingOccupancy,
  className
}: DashboardMetricsProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      <MetricCard
        title="Total Interns"
        value={totalInterns}
        description="All time intern count"
        trend={{ value: 12.5, isPositive: true }}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Active Interns"
        value={activeInterns}
        description="Currently active"
        trend={{ value: 8.2, isPositive: true }}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <MetricCard
        title="Completed Projects"
        value={completedProjects}
        description="Successfully finished"
        trend={{ value: 15.3, isPositive: true }}
        icon={<CheckCircle className="h-4 w-4" />}
      />
      <MetricCard
        title="Housing Occupancy"
        value={`${housingOccupancy}%`}
        description="Current capacity usage"
        trend={{ value: -2.1, isPositive: false }}
        icon={<Home className="h-4 w-4" />}
      />
    </div>
  );
}
