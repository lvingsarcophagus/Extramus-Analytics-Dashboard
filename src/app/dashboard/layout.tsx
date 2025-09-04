"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BarChart2, Search, Home, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/dashboard/search', label: 'Search', icon: <Search className="h-4 w-4" /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart2 className="h-4 w-4" /> },
    { href: '/dashboard/housing', label: 'Housing', icon: <Home className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        timeRangeBadge={'Yearly View'}
      />

      <div className="flex">
        <aside className="w-80 h-[calc(100vh-4rem)] p-6 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-gray-100 border-r shadow-lg flex flex-col items-center justify-start dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-950 dark:to-black dark:border-gray-800">
            <nav className="flex flex-col gap-2 w-full">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            <Card className="w-full max-w-xs mt-4 mb-8 modern-card border border-gray-200 dark:border-gray-800">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-md dark:from-blue-900 dark:to-blue-950">
                <CardTitle className="text-base font-semibold text-blue-700 flex items-center gap-2 dark:text-blue-300">
                  <span className="inline-block bg-blue-200 rounded-full p-1 mr-2"><svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="8" fill="#3B82F6" /></svg></span>
                  Access Level
                </CardTitle>
              </Header>
              <CardContent className="space-y-4 py-4 px-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Overview</span>
                  <Badge variant={hasPermission('overview') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('overview') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Intern Data</span>
                  <Badge variant={hasPermission('interns') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('interns') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Housing</span>
                  <Badge variant={hasPermission('housing') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('housing') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Demographics</span>
                  <Badge variant={hasPermission('demographics') ? 'default' : 'secondary'} className="text-xs px-2 py-1 rounded-full">
                    {hasPermission('demographics') ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] modern-section">
          {children}
        </main>
      </div>
    </div>
  );
}
