import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  DocumentIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../lib/api';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'intern' | 'hr' | 'super_admin';
  department?: string;
  nationality?: string;
}

interface LayoutProps {
  children: ReactNode;
  user: User;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  current?: boolean;
}

const Layout = ({ children, user }: LayoutProps) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['intern', 'hr', 'super_admin'] },
    { name: 'My Documents', href: '/documents', icon: DocumentIcon, roles: ['intern'] },
    { name: 'Document Management', href: '/admin/documents', icon: DocumentIcon, roles: ['hr', 'super_admin'] },
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, roles: ['super_admin'] },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, roles: ['hr', 'super_admin'] },
    { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['hr', 'super_admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  ).map(item => ({
    ...item,
    current: router.pathname === item.href
  }));

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col w-full max-w-xs bg-white">
          {/* Sidebar content for mobile */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={filteredNavigation} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent navigation={filteredNavigation} user={user} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Page header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                  {getPageTitle(router.pathname)}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <BellIcon className="h-6 w-6" />
                </button>
                
                {/* User info */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar content component
const SidebarContent = ({ navigation, user, onLogout }: {
  navigation: NavigationItem[];
  user: User;
  onLogout: () => void;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <DocumentIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Extramus</h1>
            <p className="text-xs text-gray-500">Document Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`
                w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150
                ${item.current
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={onLogout}
            className="ml-3 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get page title
const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/documents': 'My Documents',
    '/admin/documents': 'Document Management',
    '/admin/users': 'User Management',
    '/admin/analytics': 'Analytics',
    '/settings': 'Settings',
    '/profile': 'Profile',
  };

  return titles[pathname] || 'Extramus HR';
};

export default Layout;
