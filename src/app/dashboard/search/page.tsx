"use client";

import { useState, useMemo } from 'react';
import { FilterOptions } from '@/types';
import { getAvailableFilters } from '@/lib/analytics';
import { AdvancedFilterPanel } from '@/components/dashboard/AdvancedFilterPanel';
import { InternSearch } from '@/components/dashboard/InternSearch';

export default function SearchPage() {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AdvancedFilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableOptions={availableOptions}
            className="sticky top-2"
          />
        </div>
        <div className="lg:col-span-3">
          <InternSearch externalFilters={filters} />
        </div>
      </div>
    </div>
  );
}
