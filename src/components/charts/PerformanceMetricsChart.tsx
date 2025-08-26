'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

interface PerformanceData {
  month: string;
  applications: number;
  acceptances: number;
  completions: number;
  acceptanceRate: number;
  completionRate: number;
}

export function PerformanceMetricsChart() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Set a quick timeout to avoid long waits
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch('/api/interns', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        if (result.success && result.data.performanceMetrics) {
          // Process performance metrics from API
          setData(result.data.performanceMetrics);
        } else {
          // Fallback to demo data if API fails
          setData([
            { 
              month: 'Jan 2025', 
              applications: 120, 
              acceptances: 84, 
              completions: 78,
              acceptanceRate: 70,
              completionRate: 92.9
            },
            { 
              month: 'Feb 2025', 
              applications: 135, 
              acceptances: 94, 
              completions: 89,
              acceptanceRate: 69.6,
              completionRate: 94.7
            },
            { 
              month: 'Mar 2025', 
              applications: 148, 
              acceptances: 103, 
              completions: 95,
              acceptanceRate: 69.6,
              completionRate: 92.2
            },
            { 
              month: 'Apr 2025', 
              applications: 162, 
              acceptances: 116, 
              completions: 108,
              acceptanceRate: 71.6,
              completionRate: 93.1
            },
            { 
              month: 'May 2025', 
              applications: 175, 
              acceptances: 128, 
              completions: 118,
              acceptanceRate: 73.1,
              completionRate: 92.2
            },
            { 
              month: 'Jun 2025', 
              applications: 189, 
              acceptances: 142, 
              completions: 134,
              acceptanceRate: 75.1,
              completionRate: 94.4
            },
            { 
              month: 'Jul 2025', 
              applications: 203, 
              acceptances: 155, 
              completions: 146,
              acceptanceRate: 76.4,
              completionRate: 94.2
            },
            { 
              month: 'Aug 2025', 
              applications: 218, 
              acceptances: 168, 
              completions: 158,
              acceptanceRate: 77.1,
              completionRate: 94.0
            }
          ]);
        }
      } catch (err) {
        // Use demo data silently for performance
        // Always provide demo data on error
        setData([
          { 
            month: 'Jan 2025', 
            applications: 120, 
            acceptances: 84, 
            completions: 78,
            acceptanceRate: 70,
            completionRate: 92.9
          },
          { 
            month: 'Feb 2025', 
            applications: 135, 
            acceptances: 94, 
            completions: 89,
            acceptanceRate: 69.6,
            completionRate: 94.7
          },
          { 
            month: 'Mar 2025', 
            applications: 148, 
            acceptances: 103, 
            completions: 95,
            acceptanceRate: 69.6,
            completionRate: 92.2
          },
          { 
            month: 'Apr 2025', 
            applications: 162, 
            acceptances: 116, 
            completions: 108,
            acceptanceRate: 71.6,
            completionRate: 93.1
          },
          { 
            month: 'May 2025', 
            applications: 175, 
            acceptances: 128, 
            completions: 118,
            acceptanceRate: 73.1,
            completionRate: 92.2
          },
          { 
            month: 'Jun 2025', 
            applications: 189, 
            acceptances: 142, 
            completions: 134,
            acceptanceRate: 75.1,
            completionRate: 94.4
          },
          { 
            month: 'Jul 2025', 
            applications: 203, 
            acceptances: 155, 
            completions: 146,
            acceptanceRate: 76.4,
            completionRate: 94.2
          },
          { 
            month: 'Aug 2025', 
            applications: 218, 
            acceptances: 168, 
            completions: 158,
            acceptanceRate: 77.1,
            completionRate: 94.0
          }
        ]);
        setError('Using demo data (Database offline)');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
            <RefreshCw className="h-4 w-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error || 'No data available'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestData = data[data.length - 1];
  const avgAcceptanceRate = data.reduce((sum, item) => sum + item.acceptanceRate, 0) / data.length;
  const avgCompletionRate = data.reduce((sum, item) => sum + item.completionRate, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Metrics</span>
          </div>
          {error && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <AlertCircle className="h-3 w-3" />
              <span>Demo Data</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'acceptanceRate' || name === 'completionRate') {
                    return [`${value.toFixed(1)}%`, name === 'acceptanceRate' ? 'Acceptance Rate' : 'Completion Rate'];
                  }
                  return [value, name === 'applications' ? 'Applications' : name === 'acceptances' ? 'Acceptances' : 'Completions'];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="acceptanceRate" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Acceptance Rate (%)"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Completion Rate (%)"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Performance Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {latestData?.acceptanceRate.toFixed(1)}%
            </div>
            <div className="text-gray-600">Current Acceptance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {latestData?.completionRate.toFixed(1)}%
            </div>
            <div className="text-gray-600">Current Completion</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">
              {avgAcceptanceRate.toFixed(1)}%
            </div>
            <div className="text-gray-600">Avg Acceptance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">
              {avgCompletionRate.toFixed(1)}%
            </div>
            <div className="text-gray-600">Avg Completion</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
