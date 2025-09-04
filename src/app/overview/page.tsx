'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RealTimeDataDisplay } from '@/components/dashboard/RealTimeDataDisplay';
import { DatabaseStatusPanel } from '@/components/dashboard/DatabaseStatusPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Building, 
  TrendingUp, 
  Clock, 
  Award, 
  Globe,
  UserCheck,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

interface ComprehensiveData {
  overview: any;
  internDemographics: any;
  performanceMetrics: any;
  housingAnalytics: any;
  additionalInsights: any;
}

export default function OverviewPage() {
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComprehensiveData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/comprehensive-analytics');
      const result = await response.json();
      
      if (result.success) {
        setComprehensiveData(result.data);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComprehensiveData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchComprehensiveData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchComprehensiveData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Extramus Analytics Dashboard"
      />
      
      <div className="p-6 space-y-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Interns"
            value={comprehensiveData?.overview?.total_interns || 0}
            icon={<Users className="h-6 w-6" />}
            trend="+12%"
            trendColor="text-green-600"
          />
          <MetricCard
            title="Active Interns"
            value={comprehensiveData?.overview?.active_interns || 0}
            icon={<UserCheck className="h-6 w-6" />}
            subtitle={`${comprehensiveData?.overview?.completed_interns || 0} completed`}
          />
          <MetricCard
            title="Departments"
            value={comprehensiveData?.overview?.total_departments || 0}
            icon={<Building className="h-6 w-6" />}
            subtitle="Active programs"
          />
          <MetricCard
            title="Housing Occupancy"
            value={`${comprehensiveData?.overview?.overall_occupancy_rate || 0}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            subtitle={`${comprehensiveData?.overview?.occupied_rooms || 0}/${comprehensiveData?.overview?.total_rooms || 0} rooms`}
          />
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="demographics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demographics" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Demographics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="housing" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Housing
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DemographicsCard
                title="Gender Distribution"
                data={comprehensiveData?.internDemographics?.genderDistribution || []}
                type="gender"
              />
              <DemographicsCard
                title="Nationality Distribution"
                data={comprehensiveData?.internDemographics?.nationalityDistribution || []}
                type="nationality"
              />
              <DemographicsCard
                title="Age Distribution"
                data={comprehensiveData?.internDemographics?.ageDistribution || []}
                type="age"
              />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentPerformanceCard
                data={comprehensiveData?.performanceMetrics?.departmentPerformance || []}
              />
              <MonthlyTrendsCard
                data={comprehensiveData?.performanceMetrics?.monthlyTrends || []}
              />
            </div>
          </TabsContent>

          <TabsContent value="housing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OccupancyTrendsCard
                data={comprehensiveData?.housingAnalytics?.occupancyTrends || []}
              />
              <ApartmentUtilizationCard
                data={comprehensiveData?.housingAnalytics?.apartmentUtilization || []}
              />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SupervisorWorkloadCard
                data={comprehensiveData?.additionalInsights?.supervisorWorkload || []}
              />
              <InternDurationCard
                data={comprehensiveData?.additionalInsights?.internDurationAnalysis || []}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Real-time Data Displays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DatabaseStatusPanel />
          </div>
          <RealTimeDataDisplay
            title="Live Intern Data"
            endpoint="/api/interns"
            className="lg:col-span-1"
          />
          <RealTimeDataDisplay
            title="Live Housing Data"
            endpoint="/api/housing"
            className="lg:col-span-1"
          />
        </div>
      </div>
    </div>
  );
}

// Component definitions
function MetricCard({ title, value, icon, trend, trendColor, subtitle }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            {trend && <p className={`text-sm mt-1 ${trendColor}`}>{trend}</p>}
          </div>
          <div className="text-blue-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DemographicsCard({ title, data, type }: {
  title: string;
  data: any[];
  type: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => {
            const key = type === 'gender' ? 'gender' : 
                      type === 'nationality' ? 'nationality' : 'age_group';
            const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item[key]}</span>
                  <span className="font-medium">{item.count} ({percentage}%)</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DepartmentPerformanceCard({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Department Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 6).map((dept, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{dept.department_name}</span>
                <Badge variant="outline">{dept.total_interns} interns</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <span>Completion Rate: {dept.completion_rate}%</span>
                <span className="mx-2">•</span>
                <span>Avg Duration: {dept.avg_duration} days</span>
              </div>
              <Progress value={dept.completion_rate} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyTrendsCard({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(-6).map((month, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{month.month}</p>
                <p className="text-sm text-gray-600">
                  Started: {month.interns_started} • Completed: {month.interns_completed}
                </p>
              </div>
              <div className="text-right">
                <Badge 
                  variant={month.retention_rate >= 90 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {month.retention_rate}% retention
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OccupancyTrendsCard({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Occupancy Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(-6).map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{trend.month}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{trend.occupancy_rate}%</span>
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div 
                    className="h-full bg-blue-600 rounded"
                    style={{ width: `${trend.occupancy_rate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ApartmentUtilizationCard({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Apartment Utilization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((apt, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{apt.apartment_name}</span>
                <span className="text-sm text-gray-600">{apt.utilization_rate}%</span>
              </div>
              <Progress value={apt.utilization_rate} className="h-2" />
              <p className="text-xs text-gray-500">
                Preferred by: {apt.preferred_by_gender}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SupervisorWorkloadCard({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Supervisor Workload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 8).map((supervisor, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium text-sm">{supervisor.supervisor}</p>
                <p className="text-xs text-gray-600">{supervisor.department_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {supervisor.currently_supervising}/{supervisor.total_supervised}
                </p>
                <p className="text-xs text-gray-500">Current/Total</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InternDurationCard({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Internship Duration Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((dept, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <p className="font-medium">{dept.department_name}</p>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <p className="text-gray-600">Min</p>
                  <p className="font-medium">{dept.min_duration} days</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg</p>
                  <p className="font-medium">{dept.avg_duration} days</p>
                </div>
                <div>
                  <p className="text-gray-600">Max</p>
                  <p className="font-medium">{dept.max_duration} days</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {dept.total_internships} completed internships
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
