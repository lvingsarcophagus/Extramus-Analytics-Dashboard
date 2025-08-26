'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, RefreshCw } from 'lucide-react';

export function SimpleInternSearch() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Intern Search Interface
            <Badge variant="outline" className="ml-2">
              Ready
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Search */}
          <div className="space-y-2">
            <Label htmlFor="name-search">Search by Name</Label>
            <Input
              id="name-search"
              placeholder="Enter intern name..."
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Clear Filters
            </Button>
            <Button onClick={() => {}} variant="outline" size="sm">
              <RefreshCw className="h-3 w-3 mr-1" />
              Load Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Click Load Data to fetch intern information</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intern Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <p>Select an intern to view details</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
