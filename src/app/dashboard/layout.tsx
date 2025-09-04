"use client";

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        timeRangeBadge={'Yearly View'}
      />
      <div className="flex">
        <aside className="w-80 h-[calc(100vh-4rem)] p-6 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-gray-100 border-r shadow-lg flex flex-col items-center justify-start">
          <Card className="w-full max-w-xs mt-4 mb-8 modern-card border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-md">
              <CardTitle className="text-base font-semibold text-blue-700 flex items-center gap-2">
                <span className="inline-block bg-blue-200 rounded-full p-1 mr-2"><svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" fill="#3B82F6" /></svg></span>
                Access Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4 px-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Overview</span>
                <Badge variant={hasPermission('overview') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                  {hasPermission('overview') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Intern Data</span>
                <Badge variant={hasPermission('interns') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                  {hasPermission('interns') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Housing</span>
                <Badge variant={hasPermission('housing') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                  {hasPermission('housing') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Demographics</span>
                <Badge variant={hasPermission('demographics') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                  {hasPermission('demographics') ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <nav className="w-full">
            <ul>
              <li>
                <Link href="/dashboard/overview" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span className="ms-3">Overview</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/search" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span className="ms-3">Search</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/analytics" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span className="ms-3">Analytics</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/file-upload" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span className="ms-3">File Upload</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] modern-section">
          {children}
        </main>
      </div>
    </div>
  );
}
