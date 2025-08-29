'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Home, TrendingUp, AlertCircle } from 'lucide-react';

interface LiveMetrics {
  totalInterns: number;
  activeInterns: number;
  completedInterns: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  departments: number;
}

export function LiveMetricsDisplay() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setError(null);
      
      const [internsResponse, housingResponse] = await Promise.all([
        fetch('/api/interns'),
        fetch('/api/housing')
      ]);

      if (!internsResponse.ok || !housingResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const internsData = await internsResponse.json();
      const housingData = await housingResponse.json();

      if (!internsData.success || !housingData.success) {
        throw new Error('API returned error');
      }

      // Validate and sanitize data
      const interns = Array.isArray(internsData.data.interns) ? internsData.data.interns : [];
      const departmentStats = Array.isArray(internsData.data.departmentStats) ? internsData.data.departmentStats : [];
      const occupancyStats = housingData.data.occupancyStats || {};

      const totalInterns = interns.length;
      const activeInterns = interns.filter((intern: any) =>
        intern?.normalized_status?.toLowerCase() === 'active'
      ).length;
      const completedInterns = interns.filter((intern: any) =>
        intern?.normalized_status?.toLowerCase() === 'completed'
      ).length;

      // Validate housing data
      const totalRooms = Math.max(0, parseInt(String(occupancyStats.total_rooms)) || 0);
      const occupiedRooms = Math.max(0, Math.min(totalRooms, parseInt(String(occupancyStats.occupied_rooms)) || 0));
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      setMetrics({
        totalInterns,
        activeInterns,
        completedInterns,
        totalRooms,
        occupiedRooms,
        occupancyRate,
        departments: departmentStats.length
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading live metrics: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Metrics</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            ● Live
          </Badge>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Interns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalInterns}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.departments} departments
            </p>
          </CardContent>
        </Card>

        {/* Active Interns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interns</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.activeInterns}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.activeInterns / metrics.totalInterns) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        {/* Housing Occupancy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Housing Occupancy</CardTitle>
            <Home className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.occupiedRooms} of {metrics.totalRooms} rooms occupied
            </p>
          </CardContent>
        </Card>

        {/* Completed Interns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Programs</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.completedInterns}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.completedInterns / metrics.totalInterns) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
