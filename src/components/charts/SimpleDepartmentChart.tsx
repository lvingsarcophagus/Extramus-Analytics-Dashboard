'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface DepartmentData {
  department_name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export function SimpleDepartmentChart() {
  const [data, setData] = useState<DepartmentData[]>([]);
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
        
        const response = await fetch('/api/departments', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        if (result.success && result.data.chartData) {
          const chartData = result.data.chartData.map((item: any, index: number) => ({
            department_name: item.department_name,
            value: parseInt(item.value) || 0,
            color: COLORS[index % COLORS.length]
          }));
          setData(chartData);
        } else {
          // Fallback to demo data if API fails
          setData([
            { department_name: 'Engineering', value: 25, color: COLORS[0] },
            { department_name: 'Marketing', value: 18, color: COLORS[1] },
            { department_name: 'Sales', value: 15, color: COLORS[2] },
            { department_name: 'HR', value: 12, color: COLORS[3] },
            { department_name: 'Finance', value: 8, color: COLORS[4] },
            { department_name: 'IT Support', value: 6, color: COLORS[5] }
          ]);
        }
      } catch (err) {
        // Use demo data silently for performance
        // Always provide demo data on error
        setData([
          { department_name: 'Engineering', value: 25, color: COLORS[0] },
          { department_name: 'Marketing', value: 18, color: COLORS[1] },
          { department_name: 'Sales', value: 15, color: COLORS[2] },
          { department_name: 'HR', value: 12, color: COLORS[3] },
          { department_name: 'Finance', value: 8, color: COLORS[4] },
          { department_name: 'IT Support', value: 6, color: COLORS[5] }
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
            Department Distribution
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
            Department Distribution
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Department Distribution</span>
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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  `${value} interns`,
                  props.payload.department_name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.slice(0, 6).map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate" title={entry.department_name}>
                {entry.department_name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
