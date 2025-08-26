'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface RealTimeDataDisplayProps {
  title: string;
  endpoint: string;
  className?: string;
}

export function RealTimeDataDisplay({ title, endpoint, className }: RealTimeDataDisplayProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(endpoint);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check if response has content
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'API returned error');
      }
      
      setData(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`Error fetching data from ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [endpoint]);

  if (loading && !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {title} - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
            <button
              onClick={fetchData}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {endpoint.includes('interns') && data?.interns && (
            <div>
              <h4 className="font-medium mb-2">Intern Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Interns:</span>
                  <span className="font-medium ml-2">{data.interns.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Active:</span>
                  <span className="font-medium ml-2 text-green-600">
                    {data.interns.filter((i: any) => i.normalized_status === 'active').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium ml-2 text-blue-600">
                    {data.interns.filter((i: any) => i.normalized_status === 'completed').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Departments:</span>
                  <span className="font-medium ml-2">{data.departmentStats.length}</span>
                </div>
              </div>
            </div>
          )}
          
          {endpoint.includes('housing') && data?.occupancyStats && (
            <div>
              <h4 className="font-medium mb-2">Housing Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Rooms:</span>
                  <span className="font-medium ml-2">{data.occupancyStats.total_rooms}</span>
                </div>
                <div>
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium ml-2 text-red-600">
                    {data.occupancyStats.occupied_rooms}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium ml-2 text-green-600">
                    {data.occupancyStats.available_rooms}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Occupancy Rate:</span>
                  <span className="font-medium ml-2">{data.occupancyStats.occupancy_rate}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
