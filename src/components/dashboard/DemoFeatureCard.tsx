"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Home, BarChart3, Download, Filter, Shield } from 'lucide-react';

export function DemoFeatureCard() {
  return (
    <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <BarChart3 className="h-5 w-5" />
          🚀 Demo Dashboard Features
        </CardTitle>
        <CardDescription>
          This is a fully functional analytics dashboard. Try switching users to see role-based permissions in action!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">Interactive Charts</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Advanced Filtering</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-sm">Role-Based Access</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-orange-600" />
            <span className="text-sm">PDF/CSV Export</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-red-600" />
            <span className="text-sm">Intern Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-green-600" />
            <span className="text-sm">Housing Management</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline">Next.js 15</Badge>
          <Badge variant="outline">shadcn/ui</Badge>
          <Badge variant="outline">TypeScript</Badge>
          <Badge variant="outline">Recharts</Badge>
          <Badge variant="outline">Tailwind CSS</Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          💡 <strong>Try this:</strong> Use the &ldquo;Switch User&rdquo; button in the header to test different role permissions (Admin, HR, Housing, Department Head)
        </div>
      </CardContent>
    </Card>
  );
}
