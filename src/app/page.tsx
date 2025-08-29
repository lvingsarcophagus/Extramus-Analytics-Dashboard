"use client";

import { useState, useMemo } from 'react';
import { FilterOptions, ExportOptions } from '@/types';
import { calculateDashboardMetrics, getAvailableFilters } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { ExportDialog } from '@/components/dashboard/ExportDialog';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DatabaseConnection } from '@/components/dashboard/DatabaseConnection';
import { RealTimeDataDisplay } from '@/components/dashboard/RealTimeDataDisplay';
import { LiveMetricsDisplay } from '@/components/dashboard/LiveMetricsDisplay';
import { SimpleDepartmentChart } from '@/components/charts/SimpleDepartmentChart';
import { SimpleMonthlyChart } from '@/components/charts/SimpleMonthlyChart';
import { SimpleStatusChart } from '@/components/charts/SimpleStatusChart';
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

    try {
      if (options.format === 'csv') {
        // Fetch real data from API
        const response = await fetch('/api/interns');
        if (!response.ok) {
          throw new Error('Failed to fetch intern data');
        }
        const interns = await response.json();

        // Convert to CSV format
        const csvHeaders = ['Name', 'Email', 'Department', 'Status', 'Nationality', 'Gender', 'Start Date', 'End Date', 'Supervisor'];
        const csvData = [
          csvHeaders.join(','),
          ...interns.map((intern: any) => [
            `"${intern.name || ''}"`,
            `"${intern.email || ''}"`,
            `"${intern.department_name || ''}"`,
            `"${intern.status || ''}"`,
            `"${intern.nationality || ''}"`,
            `"${intern.gender || ''}"`,
            `"${intern.start_date || ''}"`,
            `"${intern.end_date || ''}"`,
            `"${intern.supervisor || ''}"`
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interns-report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        alert('CSV export completed successfully!');
      } else if (options.format === 'googleSheets') {
        // Fetch real intern data from API
        const response = await fetch('/api/interns');
        if (!response.ok) {
          throw new Error('Failed to fetch intern data');
        }
        const apiResponse = await response.json();
        
        // Extract interns array from the response
        const interns = apiResponse.data?.interns || [];
        
        if (!Array.isArray(interns)) {
          throw new Error('Invalid intern data format received from API');
        }

        // Transform data for Google Sheets export
        const exportData = interns.map((intern: any) => ({
          name: intern.name || '',
          email: intern.email || '',
          department: intern.department_name || '',
          status: intern.status || '',
          nationality: intern.nationality || '',
          gender: intern.gender || '',
          start_date: intern.start_date || '',
          end_date: intern.end_date || ''
        }));

        // Send to Google Sheets API
        const sheetsResponse = await fetch('/api/export-google-sheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: exportData,
            type: 'interns',
          }),
        });

        if (!sheetsResponse.ok) {
          const errorData = await sheetsResponse.json();
          throw new Error(errorData.error || 'Export failed');
        }

        const result = await sheetsResponse.json();
        alert(result.message || 'Data exported to Google Sheets successfully!');
      } else if (options.format === 'pdf') {
        // TODO: Implement PDF generation with real data
        alert('PDF export feature coming soon! Use CSV or Google Sheets for now.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      />

      <div className="flex">
        {/* Sidebar with Filters */}
          <aside className="w-80 h-[calc(100vh-4rem)] p-6 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-gray-100 border-r shadow-lg flex flex-col items-center justify-start">
            <Card className="w-full max-w-xs mt-4 mb-8 modern-card border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-md">
                <CardTitle className="text-base font-semibold text-blue-700 flex items-center gap-2">
                  <span className="inline-block bg-blue-200 rounded-full p-1 mr-2"><svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" fill="#3B82F6" /></svg></span>
                  Access Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-4 px-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Overview</span>
                  <Badge variant={hasPermission('overview') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('overview') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Intern Data</span>
                  <Badge variant={hasPermission('interns') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('interns') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Housing</span>
                  <Badge variant={hasPermission('housing') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('housing') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Demographics</span>
                  <Badge variant={hasPermission('demographics') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('demographics') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] modern-section">
          <div className="space-y-8">
            {/* System Status - Always visible for health monitoring */}
            <DatabaseConnection />

            {/* Quick Actions - Easy access to key functions */}
            <Card className="modern-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">Quick Actions</h3>
                    <p className="text-sm text-blue-700">Export data or manage interns</p>
                  </div>
                  <div className="flex gap-3">
                    <ExportDialog
                      onExport={handleExport}
                      className="btn-primary text-white border-0"
                    />
                    <Button
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => {
                        const searchTab = document.querySelector('[value="search"]') as HTMLElement;
                        searchTab?.click();
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Interns
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Indicators - Most important metrics first */}
            <LiveMetricsDisplay />

            {/* Primary Data Visualization - Department distribution and housing overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="modern-card">
                <SimpleDepartmentChart />
              </div>
              <div className="modern-card">
                <RealTimeDataDisplay
                  title="Live Housing Data"
                  endpoint="/api/housing"
                />
              </div>
            </div>

            {/* Detailed Analysis Tabs - Organized by priority and workflow */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className={`grid w-full h-auto ${
                (() => {
                  const tabCount = (hasPermission('overview') ? 1 : 0) +
                                   (hasPermission('interns') ? 2 : 0) +
                                   (hasPermission('housing') ? 1 : 0);
                  return tabCount === 1 ? 'grid-cols-1' :
                         tabCount === 2 ? 'grid-cols-2' :
                         tabCount === 3 ? 'grid-cols-3' : 'grid-cols-4';
                })()
              }`}>
                {hasPermission('overview') && <TabsTrigger value="overview" className="text-sm">📊 Overview</TabsTrigger>}
                {hasPermission('interns') && <TabsTrigger value="search" className="text-sm">🔍 Search</TabsTrigger>}
                {hasPermission('interns') && <TabsTrigger value="analytics" className="text-sm">� Analytics</TabsTrigger>}
                {hasPermission('housing') && <TabsTrigger value="housing" className="text-sm">🏠 Housing</TabsTrigger>}
              </TabsList>

              {hasPermission('overview') && (
                <TabsContent value="overview" className="space-y-6">
                  {/* Primary Charts Row */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="modern-card"><SimpleDepartmentChart /></div>
                    <div className="modern-card"><SimpleMonthlyChart /></div>
                    <div className="modern-card"><SimpleStatusChart /></div>
                  </div>
                  {/* Additional Charts Row */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* <div className="modern-card"><GenderDistributionChart /></div> */}
                    <div className="modern-card"><InternshipDurationChart /></div>
                    <div className="modern-card"><PerformanceMetricsChart /></div>
                  </div>
                  <div className="modern-card">
                    <RealTimeDataDisplay 
                      title="Detailed Intern Analytics" 
                      endpoint="/api/interns"
                    />
                  </div>
                </TabsContent>
              )}

              {hasPermission('interns') && (
                <TabsContent value="analytics" className="space-y-6">
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
                      {/* <GenderDistributionChart /> */}
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

          </div>
        </main>
      </div>
    </div>
  );
}
