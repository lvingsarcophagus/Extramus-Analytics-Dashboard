"use client";

import { SimpleDepartmentChart } from '@/components/charts/SimpleDepartmentChart';
import { SimpleMonthlyChart } from '@/components/charts/SimpleMonthlyChart';
import { SimpleStatusChart } from '@/components/charts/SimpleStatusChart';
import { InternshipDurationChart } from '@/components/charts/InternshipDurationChart';
import { PerformanceMetricsChart } from '@/components/charts/PerformanceMetricsChart';
import { RealTimeDataDisplay } from '@/components/dashboard/RealTimeDataDisplay';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Primary Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="modern-card"><SimpleDepartmentChart /></div>
        <div className="modern-card"><SimpleMonthlyChart /></div>
        <div className="modern-card"><SimpleStatusChart /></div>
      </div>
      {/* Additional Charts Row */}
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
