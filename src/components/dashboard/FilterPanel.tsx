"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Filter, X } from 'lucide-react';
import { FilterOptions } from '@/types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableOptions: {
    departments: string[];
    seasons: string[];
    years: number[];
  };
  className?: string;
}

export function FilterPanel({ filters, onFiltersChange, availableOptions, className }: FilterPanelProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('thisYear');

  const timeRangeOptions = {
    thisMonth: { label: 'This Month', start: new Date(2024, 11, 1), end: new Date(2024, 11, 31) },
    thisYear: { label: 'This Year', start: new Date(2024, 0, 1), end: new Date(2024, 11, 31) },
    lastYear: { label: 'Last Year', start: new Date(2023, 0, 1), end: new Date(2023, 11, 31) },
    last12Months: { label: 'Last 12 Months', start: new Date(2023, 11, 1), end: new Date(2024, 11, 31) },
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    const range = timeRangeOptions[value as keyof typeof timeRangeOptions];
    if (range) {
      onFiltersChange({
        ...filters,
        timeRange: {
          start: range.start,
          end: range.end,
          period: value === 'thisMonth' ? 'month' : 'year',
        },
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      timeRange: {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 11, 31),
        period: 'year',
      },
      departments: [],
      seasons: [],
      years: [],
    });
    setSelectedTimeRange('thisYear');
  };

  const hasActiveFilters = filters.departments.length > 0 || filters.seasons.length > 0 || filters.years.length > 0;

  return (
    <Card className={`relative ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">  {/* Increased spacing from space-y-4 to space-y-6 */}
        {/* Time Range */}
        <div className="space-y-2 relative z-40">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Time Range
          </label>
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[160]">
              {Object.entries(timeRangeOptions).map(([key, option]) => (
                <SelectItem key={key} value={key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Departments */}
        <div className="space-y-2 relative z-30">
          <label className="text-sm font-medium">Departments</label>
          <Select
            value={filters.departments.length > 0 ? filters.departments[0] : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onFiltersChange({ ...filters, departments: [] });
              } else {
                onFiltersChange({ ...filters, departments: [value] });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="z-[150] max-h-40 overflow-y-auto">
              <SelectItem value="all">All Departments</SelectItem>
              {availableOptions.departments.map(department => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seasons */}
        <div className="space-y-2 relative z-20">
          <label className="text-sm font-medium">Seasons</label>
          <Select
            value={filters.seasons.length > 0 ? filters.seasons[0] : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onFiltersChange({ ...filters, seasons: [] });
              } else {
                onFiltersChange({ ...filters, seasons: [value as 'summer' | 'winter' | 'spring' | 'fall'] });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">All Seasons</SelectItem>
              {availableOptions.seasons.map(season => (
                <SelectItem key={season} value={season} className="capitalize">
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Years */}
        <div className="space-y-2 relative z-10">
          <label className="text-sm font-medium">Years</label>
          <Select
            value={filters.years.length > 0 ? filters.years[0].toString() : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onFiltersChange({ ...filters, years: [] });
              } else {
                onFiltersChange({ ...filters, years: [parseInt(value)] });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">All Years</SelectItem>
              {availableOptions.years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
