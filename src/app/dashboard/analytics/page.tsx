"use client";

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateDashboardMetrics } from '@/lib/analytics';
import { SimpleDepartmentChart } from '@/components/charts/SimpleDepartmentChart';
import { NationalityDistributionChart } from '@/components/charts/NationalityDistributionChart';
import { SimpleStatusChart } from '@/components/charts/SimpleStatusChart';
import { PerformanceMetricsChart } from '@/components/charts/PerformanceMetricsChart';
import { RealTimeDataDisplay } from '@/components/dashboard/RealTimeDataDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const { hasPermission } = useAuth();
  const metrics = useMemo(() => calculateDashboardMetrics(), []);

  return (
    <div className="space-y-6">
      {/* Main Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {hasPermission('demographics') ? (
          <>
            <SimpleDepartmentChart />
            <NationalityDistributionChart />
          </>
        ) : (
          <Card className="col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Demographic data requires HR or Admin access</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Analytics Charts */}
      {hasPermission('demographics') && (
        <div className="grid gap-6 md:grid-cols-2">
          <SimpleStatusChart />
        </div>
      )}

      {/* Performance Overview */}
      <div className="grid gap-6 md:grid-cols-1">
        <PerformanceMetricsChart />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Intern Insights
          </CardTitle>
          <CardDescription>
            Key patterns and trends in intern participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...Object.values(metrics.departmentBreakdown))}
              </div>
              <div className="text-sm text-muted-foreground">
                Largest Department
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {hasPermission('demographics')
                  ? Object.keys(metrics.nationalityDistribution).length
                  : '•••'}
              </div>
              <div className="text-sm text-muted-foreground">
                Countries Represented
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.completedProjects > 0 ? Math.round((metrics.completedProjects / (metrics.totalInterns || 1)) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Project Success Rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RealTimeDataDisplay
        title="Detailed Demographics Data"
        endpoint="/api/interns"
      />
    </div>
  );
}
