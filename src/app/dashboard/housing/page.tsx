"use client";

import { RealTimeDataDisplay } from '@/components/dashboard/RealTimeDataDisplay';
import { AllDepartmentsDisplay } from '@/components/dashboard/AllDepartmentsDisplay';

export default function HousingPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <RealTimeDataDisplay
          title="Live Housing Analytics"
          endpoint="/api/housing"
        />
        <AllDepartmentsDisplay />
      </div>
    </div>
  );
}
