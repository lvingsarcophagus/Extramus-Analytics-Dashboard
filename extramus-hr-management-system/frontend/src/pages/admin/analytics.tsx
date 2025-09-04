import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

interface AnalyticsData {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  documentsByType: { [key: string]: number };
  documentsByMonth: { month: string; count: number }[];
  userStatistics: {
    totalUsers: number;
    activeUsers: number;
    internUsers: number;
    hrUsers: number;
  };
  completionRates: {
    overall: number;
    byDepartment: { [key: string]: number };
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Check if user has permission to access analytics
    if (user && !['hr', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchAnalyticsData();
    }
  }, [user, authLoading, router, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Demo analytics data
      const demoData: AnalyticsData = {
        totalDocuments: 847,
        verifiedDocuments: 623,
        pendingDocuments: 134,
        rejectedDocuments: 90,
        documentsByType: {
          'passport': 245,
          'diploma': 198,
          'transcript': 167,
          'visa': 123,
          'insurance': 114
        },
        documentsByMonth: [
          { month: 'Jan', count: 67 },
          { month: 'Feb', count: 89 },
          { month: 'Mar', count: 102 },
          { month: 'Apr', count: 78 },
          { month: 'May', count: 95 },
          { month: 'Jun', count: 112 },
          { month: 'Jul', count: 134 },
          { month: 'Aug', count: 170 }
        ],
        userStatistics: {
          totalUsers: 156,
          activeUsers: 142,
          internUsers: 134,
          hrUsers: 22
        },
        completionRates: {
          overall: 73.6,
          byDepartment: {
            'Engineering': 78.5,
            'Marketing': 69.2,
            'Finance': 81.3,
            'HR': 75.8,
            'Operations': 71.4
          }
        }
      };

      setAnalyticsData(demoData);
      setError('');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !['hr', 'super_admin'].includes(user.role)) {
    return null;
  }

  if (error) {
    return (
      <Layout user={user}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={fetchAnalyticsData} className="btn-primary">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Document management insights and statistics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input w-auto"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={() => alert('Export functionality coming soon!')}
              className="btn-secondary"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.totalDocuments.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{analyticsData?.verifiedDocuments.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{analyticsData?.pendingDocuments.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className={`text-2xl font-bold ${getCompletionColor(analyticsData?.completionRates.overall || 0)}`}>
                    {analyticsData?.completionRates.overall}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Types Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Documents by Type</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {analyticsData && Object.entries(analyticsData.documentsByType).map(([type, count]) => {
                  const percentage = ((count / analyticsData.totalDocuments) * 100).toFixed(1);
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Monthly Document Submissions</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {analyticsData?.documentsByMonth.map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.month} 2024</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / 170) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department Completion Rates */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Completion Rates by Department</h3>
            <p className="text-sm text-gray-500">Document verification completion percentage</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analyticsData && Object.entries(analyticsData.completionRates.byDepartment).map(([dept, rate]) => (
                <div key={dept} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getCompletionColor(rate)}`}>
                    {rate}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{dept}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">User Statistics</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analyticsData?.userStatistics.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analyticsData?.userStatistics.activeUsers}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analyticsData?.userStatistics.internUsers}</div>
                <div className="text-sm text-gray-600">Interns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analyticsData?.userStatistics.hrUsers}</div>
                <div className="text-sm text-gray-600">HR Staff</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
