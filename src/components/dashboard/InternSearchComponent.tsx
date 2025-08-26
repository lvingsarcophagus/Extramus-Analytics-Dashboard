'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  User, 
  Mail, 
  Calendar, 
  Building, 
  MapPin,
  Filter,
  X,
  RefreshCw
} from 'lucide-react';

interface InternData {
  intern_id: number;
  name: string;
  nationality: string;
  gender: string;
  birthdate: string;
  email: string;
  department_name: string;
  start_date: string;
  end_date: string;
  supervisor: string;
  status: string;
  normalized_status: string;
}

interface SearchFilters {
  name: string;
  department?: string;
  status?: string;
  nationality?: string;
  gender?: string;
}

// Generate demo data for fallback
const generateDemoInternData = (): InternData[] => {
  return [
    {
      intern_id: 1,
      name: 'Sarah Johnson',
      nationality: 'American',
      gender: 'Female',
      birthdate: '2001-03-15',
      email: 'sarah.johnson@example.com',
      department_name: 'Engineering',
      start_date: '2025-06-01',
      end_date: '2025-08-31',
      supervisor: 'Dr. Smith',
      status: 'Active',
      normalized_status: 'active'
    },
    {
      intern_id: 2,
      name: 'Ahmed Hassan',
      nationality: 'Egyptian',
      gender: 'Male',
      birthdate: '2000-11-22',
      email: 'ahmed.hassan@example.com',
      department_name: 'Marketing',
      start_date: '2025-05-15',
      end_date: '2025-07-15',
      supervisor: 'Ms. Brown',
      status: 'Completed',
      normalized_status: 'completed'
    },
    {
      intern_id: 3,
      name: 'Maria Garcia',
      nationality: 'Spanish',
      gender: 'Female',
      birthdate: '2002-01-08',
      email: 'maria.garcia@example.com',
      department_name: 'Sales',
      start_date: '2025-07-01',
      end_date: '2025-09-30',
      supervisor: 'Mr. Wilson',
      status: 'Active',
      normalized_status: 'active'
    },
    {
      intern_id: 4,
      name: 'Li Wei',
      nationality: 'Chinese',
      gender: 'Male',
      birthdate: '2001-07-30',
      email: 'li.wei@example.com',
      department_name: 'HR',
      start_date: '2025-06-15',
      end_date: '2025-08-15',
      supervisor: 'Dr. Davis',
      status: 'Pending',
      normalized_status: 'pending'
    },
    {
      intern_id: 5,
      name: 'Emily Thompson',
      nationality: 'Canadian',
      gender: 'Female',
      birthdate: '2000-09-12',
      email: 'emily.thompson@example.com',
      department_name: 'Finance',
      start_date: '2025-05-01',
      end_date: '2025-07-31',
      supervisor: 'Ms. Johnson',
      status: 'Completed',
      normalized_status: 'completed'
    },
    {
      intern_id: 6,
      name: 'Rajesh Patel',
      nationality: 'Indian',
      gender: 'Male',
      birthdate: '2001-12-05',
      email: 'rajesh.patel@example.com',
      department_name: 'IT Support',
      start_date: '2025-08-01',
      end_date: '2025-10-31',
      supervisor: 'Mr. Anderson',
      status: 'Active',
      normalized_status: 'active'
    }
  ];
};

export function InternSearchComponent() {
  const [allInterns, setAllInterns] = useState<InternData[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<InternData[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [error, setError] = useState<string | null>(null);
  const [selectedIntern, setSelectedIntern] = useState<InternData | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    department: '',
    status: '',
    nationality: '',
    gender: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set a timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/interns', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // If API fails, use demo data
        const demoData = generateDemoInternData();
        setAllInterns(demoData);
        setFilteredInterns(demoData);
        
        // Extract unique values for filters from demo data
        const uniqueDepartments = [...new Set(demoData.map((i: InternData) => i.department_name).filter(Boolean))] as string[];
        const uniqueNationalities = [...new Set(demoData.map((i: InternData) => i.nationality).filter(Boolean))] as string[];
        
        setDepartments(uniqueDepartments.sort());
        setNationalities(uniqueNationalities.sort());
        
        setError('Using demo data (Database offline)');
        return;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch intern data');
      }
      
      const interns = result.data.interns;
      
      setAllInterns(interns);
      setFilteredInterns(interns);
      
      // Extract unique values for filters
      const uniqueDepartments = [...new Set(interns.map((i: InternData) => i.department_name).filter(Boolean))] as string[];
      const uniqueNationalities = [...new Set(interns.map((i: InternData) => i.nationality).filter(Boolean))] as string[];
      
      setDepartments(uniqueDepartments.sort());
      setNationalities(uniqueNationalities.sort());
      
    } catch (err) {
      console.error('Error fetching intern data:', err);
      
      // Use demo data as fallback
      const demoData = generateDemoInternData();
      setAllInterns(demoData);
      setFilteredInterns(demoData);
      
      // Extract unique values for filters from demo data
      const uniqueDepartments = [...new Set(demoData.map((i: InternData) => i.department_name).filter(Boolean))] as string[];
      const uniqueNationalities = [...new Set(demoData.map((i: InternData) => i.nationality).filter(Boolean))] as string[];
      
      setDepartments(uniqueDepartments.sort());
      setNationalities(uniqueNationalities.sort());
      
      setError('Using demo data (Database connection failed)');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      department: undefined,
      status: undefined,
      nationality: undefined,
      gender: undefined
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = allInterns;
    
    if (filters.name) {
      filtered = filtered.filter(intern => 
        intern.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.department) {
      filtered = filtered.filter(intern => 
        intern.department_name === filters.department
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(intern => 
        intern.normalized_status === filters.status
      );
    }
    
    if (filters.nationality) {
      filtered = filtered.filter(intern => 
        intern.nationality === filters.nationality
      );
    }
    
    if (filters.gender) {
      filtered = filtered.filter(intern => 
        intern.gender.toLowerCase() === filters.gender!.toLowerCase()
      );
    }
    
    setFilteredInterns(filtered);
  }, [filters, allInterns]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Intern Search
            <RefreshCw className="h-4 w-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading intern data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Search className="h-5 w-5" />
            Intern Search - {error.includes('demo') ? 'Demo Mode' : 'Error'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-600 mb-3">{error}</p>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Search and Filters */}
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Interns
            <Badge variant="outline" className="ml-2">
              {filteredInterns.length} of {allInterns.length}
            </Badge>
            {error && error.includes('demo') && (
              <Badge variant="secondary" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                Demo Data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Search */}
          <div className="space-y-2">
            <Label htmlFor="name-search">Search by Name</Label>
            <Input
              id="name-search"
              placeholder="Enter intern name..."
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-20">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent className="max-h-40 overflow-y-auto z-[200]">
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="z-[190]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nationality</Label>
              <Select
                value={filters.nationality}
                onValueChange={(value) => setFilters(prev => ({ ...prev, nationality: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All nationalities" />
                </SelectTrigger>
                <SelectContent className="max-h-40 overflow-y-auto z-[180]">
                  {nationalities.map(nationality => (
                    <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={filters.gender}
                onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent className="z-[170]">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0">
        {/* Intern List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="secondary">{filteredInterns.length} interns</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredInterns.map((intern) => (
                <div
                  key={intern.intern_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedIntern?.intern_id === intern.intern_id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedIntern(intern)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{intern.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{intern.department_name}</p>
                    </div>
                    <Badge className={`ml-2 flex-shrink-0 ${getStatusColor(intern.normalized_status)}`}>
                      {intern.normalized_status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {filteredInterns.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No interns match your search criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Intern Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Intern Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedIntern ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedIntern.name}</h3>
                  <Badge className={getStatusColor(selectedIntern.normalized_status)}>
                    {selectedIntern.normalized_status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm truncate">{selectedIntern.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm truncate">{selectedIntern.department_name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{selectedIntern.nationality}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{selectedIntern.gender}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">Born: {formatDate(selectedIntern.birthdate)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">
                      Duration: {formatDate(selectedIntern.start_date)} - {formatDate(selectedIntern.end_date)}
                    </span>
                  </div>

                  {selectedIntern.supervisor && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">Supervisor: {selectedIntern.supervisor}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Intern ID: {selectedIntern.intern_id}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select an intern from the list to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
