"use client";

import { useAuth } from '@/contexts/AuthContext';
import { UserSwitcher } from './UserSwitcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, Settings, LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
  timeRangeBadge?: string;
}

export function DashboardHeader({ 
  title = "Extramus Analytics Dashboard", 
  timeRangeBadge
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'hr': return 'bg-blue-500';
      case 'housing': return 'bg-green-500';
      case 'department_head': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'hr': return 'Human Resources';
      case 'housing': return 'Housing Manager';
      case 'department_head': return 'Department Head';
      default: return role;
    }
  };

  if (!user) return null;

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {timeRangeBadge && (
            <Badge variant="secondary" className="text-sm">
              {timeRangeBadge}
            </Badge>
          )}
          
          <UserSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={getRoleColor(user.role)}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[250]" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant="outline" className="w-fit text-xs mt-1">
                    {getRoleLabel(user.role)}
                  </Badge>
                  {user.department && (
                    <p className="text-xs text-muted-foreground">
                      {user.department}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
