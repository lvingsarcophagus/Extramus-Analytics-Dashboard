export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'housing' | 'department_head';
  department?: string;
}

export interface Intern {
  id: string;
  name: string;
  email: string;
  department: string;
  season: 'summer' | 'winter' | 'spring' | 'fall';
  year: number;
  startDate: Date;
  endDate: Date;
  nationality: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  projectId?: string;
  housingId?: string;
  status: 'active' | 'completed' | 'withdrawn';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  department: string;
  internIds: string[];
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  completionPercentage: number;
  startDate: Date;
  endDate: Date;
  mentorId: string;
}

export interface HousingUnit {
  id: string;
  name: string;
  type: 'apartment' | 'dormitory' | 'shared_house';
  capacity: number;
  currentOccupancy: number;
  address: string;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export interface HousingAssignment {
  id: string;
  internId: string;
  housingUnitId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
}

export interface FilterOptions {
  timeRange: {
    start: Date;
    end: Date;
    period: 'month' | 'semester' | 'year';
  };
  departments: string[];
  seasons: ('summer' | 'winter' | 'spring' | 'fall')[];
  years: number[];
}

export interface DashboardMetrics {
  totalInterns: number;
  activeInterns: number;
  completedProjects: number;
  housingOccupancy: number;
  departmentBreakdown: Record<string, number>;
  seasonalTrends: Array<{
    period: string;
    interns: number;
    projects: number;
  }>;
  nationalityDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'googleSheets';
  includeCharts: boolean;
  sections: Array<'overview' | 'interns' | 'projects' | 'housing'>;
  dateRange: {
    start: Date;
    end: Date;
  };
}
