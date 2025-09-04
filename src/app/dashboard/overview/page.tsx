"use client";

import { RealTimeDataDisplay } from '@/components/dashboard/RealTimeDataDisplay';
import { SimpleDepartmentChart } from '@/components/charts/SimpleDepartmentChart';
import { SimpleMonthlyChart } from '@/components/charts/SimpleMonthlyChart';
import { SimpleStatusChart } from '@/components/charts/SimpleStatusChart';
import { InternshipDurationChart } from '@/components/charts/InternshipDurationChart';
import { PerformanceMetricsChart } from '@/components/charts/PerformanceMetricsChart';
import { DatabaseConnection } from '@/components/dashboard/DatabaseConnection';
import { LiveMetricsDisplay } from '@/components/dashboard/LiveMetricsDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { ExportDialog } from '@/components/dashboard/ExportDialog';
import { useAuth } from '@/contexts/AuthContext';
import { ExportOptions } from '@/types';

export default function OverviewPage() {
  const { hasPermission } = useAuth();
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

  return (
    <div className="space-y-8">
      <DatabaseConnection />
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
                  window.location.href = '/dashboard/search';
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Interns
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <LiveMetricsDisplay />
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="modern-card"><SimpleDepartmentChart /></div>
        <div className="modern-card"><SimpleMonthlyChart /></div>
        <div className="modern-card"><SimpleStatusChart /></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="modern-card"><InternshipDurationChart /></div>
        <div className="modern-card"><PerformanceMetricsChart /></div>
      </div>
      <div className="modern-card">
        <RealTimeDataDisplay
          title="Detailed Intern Analytics"
          endpoint="/api/interns"
        />
      </div>
    </div>
  );
}
