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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Filter, X, RefreshCw, ChevronDown, ChevronRight, Building } from 'lucide-react';
import { FilterOptions } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface AdvancedFilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableOptions: {
    departments: string[];
    seasons: string[];
    years: number[];
  };
  className?: string;
}

export function AdvancedFilterPanel({ filters, onFiltersChange, availableOptions, className }: AdvancedFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    dateRange: true,
    departments: false,
    advanced: false
  });
  
  const [dateRangeType, setDateRangeType] = useState<string>('preset');
  const [fromDate, setFromDate] = useState<Date | undefined>(filters.timeRange.start);
  const [toDate, setToDate] = useState<Date | undefined>(filters.timeRange.end);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Preset date ranges
  const presetRanges = {
    thisMonth: { 
      label: 'This Month', 
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    },
    lastMonth: {
      label: 'Last Month',
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    },
    thisYear: { 
      label: 'This Year', 
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date(new Date().getFullYear(), 11, 31)
    },
    lastYear: { 
      label: 'Last Year', 
      start: new Date(new Date().getFullYear() - 1, 0, 1), 
      end: new Date(new Date().getFullYear() - 1, 11, 31) 
    },
    last3Months: { 
      label: 'Last 3 Months', 
      start: new Date(new Date().setMonth(new Date().getMonth() - 3)), 
      end: new Date() 
    },
    last6Months: { 
      label: 'Last 6 Months', 
      start: new Date(new Date().setMonth(new Date().getMonth() - 6)), 
      end: new Date() 
    },
    last12Months: { 
      label: 'Last 12 Months', 
      start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      end: new Date()
    },
    allTime: {
      label: 'All Time',
      start: new Date(2000, 0, 1),
      end: new Date(2030, 11, 31)
    }
  };

  const handlePresetRangeChange = (value: string) => {
    const range = presetRanges[value as keyof typeof presetRanges];
    if (range) {
      setFromDate(range.start);
      setToDate(range.end);
      onFiltersChange({
        ...filters,
        timeRange: {
          start: range.start,
          end: range.end,
          period: value.includes('Month') ? 'month' : 'year',
        },
      });
    }
  };

  const handleCustomDateChange = () => {
    if (fromDate && toDate) {
      onFiltersChange({
        ...filters,
        timeRange: {
          start: fromDate,
          end: toDate,
          period: 'custom',
        },
      });
    }
  };

  const handleDepartmentChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, departments: [] });
    } else {
      onFiltersChange({ ...filters, departments: [value] });
    }
  };

  const handleYearChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, years: [] });
    } else {
      onFiltersChange({ ...filters, years: [parseInt(value)] });
    }
  };

  const handleSeasonChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, seasons: [] });
    } else {
      onFiltersChange({ 
        ...filters, 
        seasons: [value as 'summer' | 'winter' | 'spring' | 'fall'] 
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      timeRange: presetRanges.allTime.start 
        ? {
            start: presetRanges.allTime.start,
            end: presetRanges.allTime.end,
            period: 'year',
          }
        : {
            start: new Date(2000, 0, 1),
            end: new Date(2030, 11, 31),
            period: 'year',
          },
      departments: [],
      seasons: [],
      years: [],
    });
    setDateRangeType('preset');
    setFromDate(presetRanges.thisYear.start);
    setToDate(presetRanges.thisYear.end);
  };

  const hasActiveFilters = filters.departments.length > 0 || 
                           filters.seasons.length > 0 || 
                           filters.years.length > 0 ||
                           dateRangeType === 'custom';

  return (
    <Card className={`relative ${className || ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Section */}
        <div className="border rounded-md">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
            onClick={() => toggleSection('dateRange')}
          >
            <h3 className="text-sm font-medium flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Date Range
            </h3>
            {expandedSections.dateRange ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          
          {expandedSections.dateRange && (
            <div className="p-3 pt-0 border-t">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    variant={dateRangeType === 'preset' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRangeType('preset')}
                    className="text-xs h-7 px-2"
                  >
                    Preset Ranges
                  </Button>
                  <Button
                    variant={dateRangeType === 'custom' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRangeType('custom')}
                    className="text-xs h-7 px-2"
                  >
                    Custom Range
                  </Button>
                </div>

                {dateRangeType === 'preset' ? (
                  <div className="space-y-2">
                    <Select defaultValue="thisYear" onValueChange={handlePresetRangeChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                        <SelectItem value="last3Months">Last 3 Months</SelectItem>
                        <SelectItem value="last6Months">Last 6 Months</SelectItem>
                        <SelectItem value="thisYear">This Year</SelectItem>
                        <SelectItem value="lastYear">Last Year</SelectItem>
                        <SelectItem value="last12Months">Last 12 Months</SelectItem>
                        <SelectItem value="allTime">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="from-date" className="text-xs">From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {fromDate ? (
                              format(fromDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) => {
                              setFromDate(date);
                              if (date && toDate && date > toDate) {
                                setToDate(date);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="to-date" className="text-xs">To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {toDate ? (
                              format(toDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={setToDate}
                            disabled={(date) => date < (fromDate || new Date(2000, 0, 1))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={handleCustomDateChange}
                      disabled={!fromDate || !toDate}
                    >
                      Apply Custom Range
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Department Filter Section */}
        <div className="border rounded-md">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
            onClick={() => toggleSection('departments')}
          >
            <h3 className="text-sm font-medium flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Departments & Years
            </h3>
            {expandedSections.departments ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          
          {expandedSections.departments && (
            <div className="p-3 pt-0 border-t space-y-3">
              {/* Department dropdown */}
              <div className="space-y-1 pt-2">
                <Label htmlFor="department" className="text-xs">Department</Label>
                <Select
                  value={filters.departments.length > 0 ? filters.departments[0] : "all"}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    <SelectItem value="all">All Departments</SelectItem>
                    {availableOptions.departments.map(department => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year dropdown */}
              <div className="space-y-1">
                <Label htmlFor="year" className="text-xs">Year</Label>
                <Select
                  value={filters.years.length > 0 ? filters.years[0].toString() : "all"}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableOptions.years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Season dropdown */}
              <div className="space-y-1">
                <Label htmlFor="season" className="text-xs">Season</Label>
                <Select
                  value={filters.seasons.length > 0 ? filters.seasons[0] : "all"}
                  onValueChange={handleSeasonChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    {availableOptions.seasons.map(season => (
                      <SelectItem key={season} value={season} className="capitalize">
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Filter summary */}
        <div className="text-xs text-muted-foreground border-t pt-3 mt-2">
          {hasActiveFilters ? (
            <div className="space-y-1">
              <div>Active filters:</div>
              {dateRangeType === 'custom' ? (
                <Badge variant="secondary" className="mr-1 font-normal">
                  {fromDate && toDate ? `${format(fromDate, "MMM d, yyyy")} - ${format(toDate, "MMM d, yyyy")}` : "Custom range"}
                </Badge>
              ) : (
                <>
                  {Object.entries(presetRanges).map(([key, range]) => {
                    if (
                      filters.timeRange.start?.getTime() === range.start.getTime() &&
                      filters.timeRange.end?.getTime() === range.end.getTime()
                    ) {
                      return (
                        <Badge key={key} variant="secondary" className="mr-1 font-normal">
                          {range.label}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </>
              )}
              {filters.departments.map((dept) => (
                <Badge key={dept} variant="secondary" className="mr-1 font-normal">
                  {dept}
                </Badge>
              ))}
              {filters.years.map((year) => (
                <Badge key={year} variant="secondary" className="mr-1 font-normal">
                  {year}
                </Badge>
              ))}
              {filters.seasons.map((season) => (
                <Badge key={season} variant="secondary" className="mr-1 font-normal capitalize">
                  {season}
                </Badge>
              ))}
            </div>
          ) : (
            <div>No active filters - showing all data</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
