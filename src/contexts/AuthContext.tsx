"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { sampleUsers } from '@/lib/data/sample-data';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(sampleUsers[0]); // Default to Jules for demo

  const login = async (email: string): Promise<boolean> => {
    // Mock authentication - in real app would call API with email and password
    const foundUser = sampleUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (section: string): boolean => {
    if (!user) return false;
    
    switch (section) {
      case 'overview':
        return true; // All roles can view overview
      case 'interns':
        return ['admin', 'hr', 'department_head'].includes(user.role);
      case 'projects':
        return ['admin', 'department_head'].includes(user.role);
      case 'housing':
        return ['admin', 'housing'].includes(user.role);
      case 'demographics':
        return ['admin', 'hr'].includes(user.role);
      case 'export':
        return ['admin', 'hr', 'department_head'].includes(user.role);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
