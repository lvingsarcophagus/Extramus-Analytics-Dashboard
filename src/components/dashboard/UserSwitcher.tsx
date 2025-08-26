"use client";

import { useAuth } from '@/contexts/AuthContext';
import { sampleUsers } from '@/lib/data/sample-data';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle, ChevronDown } from 'lucide-react';

export function UserSwitcher() {
  const { user, login } = useAuth();

  const handleUserSwitch = async (email: string) => {
    await login(email);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCircle className="h-4 w-4" />
          Switch User
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Demo Users</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sampleUsers.map(demoUser => (
          <DropdownMenuItem
            key={demoUser.id}
            onClick={() => handleUserSwitch(demoUser.email)}
            className={user?.id === demoUser.id ? 'bg-accent' : ''}
          >
            <div className="flex flex-col gap-1">
              <div className="font-medium">{demoUser.name}</div>
              <div className="text-xs text-muted-foreground">
                {demoUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {demoUser.department && ` • ${demoUser.department}`}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
