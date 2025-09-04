export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'housing' | 'department_head';
  department?: string;
}

export interface Intern {
  id: string;
  intern_id: number;
  name: string;
  email: string;
  phone?: string;
  emergency_contact?: string;
  dietary_restrictions?: string;
  special_requirements?: string;
  department: string;
  department_id?: number;
  department_name?: string;
  season: 'summer' | 'winter' | 'spring' | 'fall';
  year: number;
  startDate: Date;
  start_date?: string;
  endDate: Date;
  end_date?: string;
  nationality: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthdate?: string;
  age?: number;
  projectId?: string;
  project_title?: string;
  project_description?: string;
  housingId?: string;
  supervisor?: string;
  hourly_wage?: number;
  total_hours_expected?: number;
  hours_completed?: number;
  progress_percentage?: number;
  performance_rating?: number;
  feedback_notes?: string;
  duration_days?: number;
  status: 'active' | 'completed' | 'withdrawn' | 'pending';
  normalized_status?: string;
  calculated_status?: string;
  original_status?: string;
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
  apartment_id?: number;
  apartment_name?: string;
  name: string;
  type: 'apartment' | 'dormitory' | 'shared_house';
  building_type?: string;
  capacity: number;
  total_capacity?: number;
  currentOccupancy: number;
  current_occupancy?: number;
  max_occupancy?: number;
  address: string;
  amenities: string[];
  monthly_rent?: number;
  apartment_rent?: number;
  utilities_included?: boolean;
  room_id?: number;
  room_number?: string;
  is_single?: boolean;
  is_full?: boolean;
  room_size_sqft?: number;
  private_bathroom?: boolean;
  air_conditioning?: boolean;
  furnished?: boolean;
  room_rent?: number;
  room_status?: string;
  room_utilization_rate?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'partially_occupied';
}

export interface HousingAssignment {
  id: string;
  internId: string;
  housingUnitId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
}

export interface DepartmentStats {
  department_name: string;
  intern_count: number;
  active_count: number;
  completed_count: number;
  pending_count?: number;
  avg_performance_rating?: number;
  avg_duration_days?: number;
  total_hours_expected?: number;
  total_hours_completed?: number;
  overall_progress_rate?: number;
  completion_rate?: number;
  total_interns?: number;
}

export interface SupervisorStats {
  supervisor: string;
  department_name: string;
  total_supervised: number;
  currently_supervising: number;
  avg_supervisee_rating?: number;
  completed_supervisions?: number;
}

export interface MonthlyStats {
  month: string;
  interns_started: number;
  interns_completed: number;
  currently_active?: number;
  avg_duration_days?: number;
  avg_performance_rating?: number;
  total_hours_planned?: number;
  total_hours_completed?: number;
  completion_rate_percentage?: number;
  retention_rate?: number;
}

export interface Demographics {
  category: 'gender' | 'nationality' | 'age';
  value: string;
  count: number;
  gender?: string;
  nationality?: string;
  age_group?: string;
}

export interface FilterOptions {
  timeRange: {
    start: Date;
    end: Date;
    period: 'month' | 'semester' | 'year' | 'custom';
  };
  departments: string[];
  seasons: ('summer' | 'winter' | 'spring' | 'fall')[];
  years: number[];
  status: ('active' | 'completed' | 'withdrawn' | 'pending')[];
  gender: ('male' | 'female' | 'other' | 'prefer_not_to_say')[];
}

export interface DashboardMetrics {
  totalInterns: number;
  activeInterns: number;
  completedInterns: number;
  pendingInterns?: number;
  completedProjects: number;
  housingOccupancy: number;
  totalDepartments?: number;
  totalRooms?: number;
  occupiedRooms?: number;
  departmentBreakdown: Record<string, number>;
  seasonalTrends: Array<{
    period: string;
    interns: number;
    projects: number;
  }>;
  nationalityDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
}

export interface ComprehensiveAnalytics {
  overview: {
    total_interns: number;
    active_interns: number;
    completed_interns: number;
    pending_interns: number;
    total_departments: number;
    total_housing_units: number;
    total_rooms: number;
    occupied_rooms: number;
    overall_occupancy_rate: number;
  };
  internDemographics: {
    genderDistribution: Demographics[];
    nationalityDistribution: Demographics[];
    ageDistribution: Demographics[];
  };
  performanceMetrics: {
    departmentPerformance: DepartmentStats[];
    monthlyTrends: MonthlyStats[];
  };
  housingAnalytics: {
    occupancyTrends: Array<{
      month: string;
      occupancy_rate: number;
      total_occupants: number;
    }>;
    apartmentUtilization: Array<{
      apartment_name: string;
      utilization_rate: number;
      preferred_by_gender: string;
    }>;
  };
  additionalInsights: {
    supervisorWorkload: SupervisorStats[];
    internDurationAnalysis: Array<{
      department_name: string;
      min_duration: number;
      max_duration: number;
      avg_duration: number;
      total_internships: number;
    }>;
  };
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
