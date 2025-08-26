'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, Users, Building } from 'lucide-react';

interface DepartmentData {
  id: number;
  department_name: string;
  intern_count: number;
  active_count: number;
  completed_count: number;
  pending_count: number;
}

export function AllDepartmentsDisplay() {
  const [data, setData] = useState<{
    departments: DepartmentData[];
    totalDepartments: number;
    activeDepartments: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch departments');
      }
      
      setData(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            All Departments
            <RefreshCw className="h-4 w-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            All Departments - Error
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

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            All Departments
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.activeDepartments} Active
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {data.totalDepartments} Total
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
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.departments.map((dept) => (
            <div 
              key={dept.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h4 className="font-medium text-sm">{dept.department_name}</h4>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {dept.intern_count} total
                  </span>
                  {dept.active_count > 0 && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      {dept.active_count} active
                    </Badge>
                  )}
                  {dept.completed_count > 0 && (
                    <Badge variant="outline" className="text-xs text-blue-600">
                      {dept.completed_count} completed
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {dept.intern_count === 0 ? (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    No interns
                  </Badge>
                ) : (
                  <div className="text-lg font-bold text-blue-600">
                    {dept.intern_count}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {data.departments.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No department data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
