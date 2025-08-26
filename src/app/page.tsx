"use client";

import { useState, useMemo } from 'react';
import { FilterOptions, ExportOptions } from '@/types';
import { calculateDashboardMetrics, getAvailableFilters } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ExportDialog } from '@/components/dashboard/ExportDialog';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DatabaseConnection } from '@/components/dashboard/DatabaseConnection';
import { RealTimeDataDisplay } from '@/components/dashboard/RealTimeDataDisplay';
import { LiveMetricsDisplay } from '@/components/dashboard/LiveMetricsDisplay';
import { SimpleDepartmentChart } from '@/components/charts/SimpleDepartmentChart';
import { SimpleMonthlyChart } from '@/components/charts/SimpleMonthlyChart';
import { SimpleStatusChart } from '@/components/charts/SimpleStatusChart';
import { GenderDistributionChart } from '@/components/charts/GenderDistributionChart';
import { NationalityDistributionChart } from '@/components/charts/NationalityDistributionChart';
import { InternshipDurationChart } from '@/components/charts/InternshipDurationChart';
import { PerformanceMetricsChart } from '@/components/charts/PerformanceMetricsChart';
import { AllDepartmentsDisplay } from '@/components/dashboard/AllDepartmentsDisplay';
import { InternSearchComponent } from '@/components/dashboard/InternSearchComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31),
      period: 'year',
    },
    departments: [],
    seasons: [],
    years: [],
  });

  const availableOptions = useMemo(() => getAvailableFilters(), []);
  const metrics = useMemo(() => calculateDashboardMetrics(undefined, undefined, undefined, filters), [filters]);

  const handleExport = async (options: ExportOptions) => {
    if (!hasPermission('export')) {
      alert('You do not have permission to export reports.');
      return;
    }

    // TODO: Replace with real data export from API
    // Removed console.log for performance
    
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (options.format === 'csv') {
      // TODO: Fetch real data from API and generate CSV
      const csvData = 'Department,Interns,Status\nData Science,10,Active\nEngineering,8,Active';
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // TODO: Implement PDF generation with real data
      alert('PDF report would be generated here');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Please log in to access the dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader
        timeRangeBadge={filters.timeRange.period === 'year' ? 'Yearly View' : 'Monthly View'}
        onExport={hasPermission('export') ? () => {
          const dialog = document.querySelector('[data-export-dialog]') as HTMLButtonElement;
          dialog?.click();
        } : undefined}
      />

      <div className="flex">
        {/* Sidebar with Filters */}
        <aside className="w-80 border-r bg-card h-[calc(100vh-4rem)] p-6 overflow-y-auto">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableOptions={availableOptions}
          />
          
          {/* Role-based access info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Access Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Overview</span>
                <Badge variant={hasPermission('overview') ? 'default' : 'secondary'} className="text-xs">
                  {hasPermission('overview') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Intern Data</span>
                <Badge variant={hasPermission('interns') ? 'default' : 'secondary'} className="text-xs">
                  {hasPermission('interns') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Housing</span>
                <Badge variant={hasPermission('housing') ? 'default' : 'secondary'} className="text-xs">
                  {hasPermission('housing') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Demographics</span>
                <Badge variant={hasPermission('demographics') ? 'default' : 'secondary'} className="text-xs">
                  {hasPermission('demographics') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="space-y-8">
            {/* Database Connection Status */}
            <DatabaseConnection />

            {/* Live Metrics Dashboard */}
            <LiveMetricsDisplay />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleDepartmentChart />
              <RealTimeDataDisplay 
                title="Live Housing Data" 
                endpoint="/api/housing"
              />
            </div>

            {/* Tabbed Content */}
            <Tabs defaultValue="search" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                {hasPermission('overview') && <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>}
                {hasPermission('interns') && <TabsTrigger value="interns" className="text-sm">Analytics</TabsTrigger>}
                {hasPermission('interns') && <TabsTrigger value="search" className="text-sm">🔍 Search</TabsTrigger>}
                {hasPermission('housing') && <TabsTrigger value="housing" className="text-sm">Housing</TabsTrigger>}
              </TabsList>

              {hasPermission('overview') && (
                <TabsContent value="overview" className="space-y-6">
                  {/* Primary Charts Row */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <SimpleDepartmentChart />
                    <SimpleMonthlyChart />
                    <SimpleStatusChart />
                  </div>
                  
                  {/* Additional Charts Row */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <GenderDistributionChart />
                    <InternshipDurationChart />
                    <PerformanceMetricsChart />
                  </div>
                  
                  <RealTimeDataDisplay 
                    title="Detailed Intern Analytics" 
                    endpoint="/api/interns"
                  />
                </TabsContent>
              )}

              {hasPermission('interns') && (
                <TabsContent value="interns" className="space-y-6">
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
                      <GenderDistributionChart />
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
                </TabsContent>
              )}

              {hasPermission('interns') && (
                <TabsContent value="search" className="space-y-6">
                  <InternSearchComponent />
                </TabsContent>
              )}

              {hasPermission('housing') && (
                <TabsContent value="housing" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <RealTimeDataDisplay 
                      title="Live Housing Analytics" 
                      endpoint="/api/housing"
                    />
                    <AllDepartmentsDisplay />
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Hidden Export Dialog Trigger */}
            {hasPermission('export') && (
              <div className="hidden">
                <ExportDialog onExport={handleExport} />
                <Button data-export-dialog className="hidden">Hidden Export Trigger</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
