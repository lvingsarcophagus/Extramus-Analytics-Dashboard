import { Intern, Project, HousingUnit, HousingAssignment, User } from '@/types';

// Sample users with different roles
export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Jules Anderson',
    email: 'jules@company.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Sarah Kim',
    email: 'sarah.kim@company.com',
    role: 'hr',
    department: 'Human Resources'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'housing'
  },
  {
    id: '4',
    name: 'Dr. Lisa Chen',
    email: 'lisa.chen@company.com',
    role: 'department_head',
    department: 'Engineering'
  }
];

// Sample intern data
export const sampleInterns: Intern[] = [
  {
    id: '1',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@university.edu',
    department: 'Engineering',
    season: 'summer',
    year: 2024,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    nationality: 'USA',
    gender: 'female',
    projectId: '1',
    housingId: '1',
    status: 'completed'
  },
  {
    id: '2',
    name: 'Raj Patel',
    email: 'raj.patel@university.edu',
    department: 'Data Science',
    season: 'summer',
    year: 2024,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    nationality: 'India',
    gender: 'male',
    projectId: '2',
    housingId: '2',
    status: 'completed'
  },
  {
    id: '3',
    name: 'Sophie Miller',
    email: 'sophie.miller@university.edu',
    department: 'Marketing',
    season: 'winter',
    year: 2024,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    nationality: 'Germany',
    gender: 'female',
    projectId: '3',
    housingId: '1',
    status: 'active'
  },
  {
    id: '4',
    name: 'Kevin Wu',
    email: 'kevin.wu@university.edu',
    department: 'Engineering',
    season: 'winter',
    year: 2024,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    nationality: 'Canada',
    gender: 'male',
    projectId: '4',
    housingId: '3',
    status: 'active'
  },
  {
    id: '5',
    name: 'Maria Santos',
    email: 'maria.santos@university.edu',
    department: 'Finance',
    season: 'summer',
    year: 2023,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-08-31'),
    nationality: 'Brazil',
    gender: 'female',
    projectId: '5',
    housingId: '2',
    status: 'completed'
  }
];

// Sample project data
export const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'Mobile App Development',
    description: 'Developing a mobile application for customer engagement',
    department: 'Engineering',
    internIds: ['1'],
    status: 'completed',
    completionPercentage: 100,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    mentorId: '4'
  },
  {
    id: '2',
    title: 'Data Analytics Pipeline',
    description: 'Building an automated data pipeline for business intelligence',
    department: 'Data Science',
    internIds: ['2'],
    status: 'completed',
    completionPercentage: 95,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    mentorId: '2'
  },
  {
    id: '3',
    title: 'Social Media Campaign',
    description: 'Creating and executing a comprehensive social media strategy',
    department: 'Marketing',
    internIds: ['3'],
    status: 'active',
    completionPercentage: 65,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    mentorId: '2'
  },
  {
    id: '4',
    title: 'Cloud Infrastructure',
    description: 'Migrating legacy systems to cloud infrastructure',
    department: 'Engineering',
    internIds: ['4'],
    status: 'active',
    completionPercentage: 40,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    mentorId: '4'
  },
  {
    id: '5',
    title: 'Financial Modeling',
    description: 'Developing predictive financial models',
    department: 'Finance',
    internIds: ['5'],
    status: 'completed',
    completionPercentage: 100,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-08-31'),
    mentorId: '2'
  }
];

// Sample housing data
export const sampleHousingUnits: HousingUnit[] = [
  {
    id: '1',
    name: 'Downtown Apartments A',
    type: 'apartment',
    capacity: 4,
    currentOccupancy: 2,
    address: '123 Main St, Downtown',
    amenities: ['WiFi', 'Laundry', 'Kitchen', 'Parking'],
    status: 'occupied'
  },
  {
    id: '2',
    name: 'University Dorm B',
    type: 'dormitory',
    capacity: 2,
    currentOccupancy: 1,
    address: '456 College Ave, University District',
    amenities: ['WiFi', 'Shared Kitchen', 'Study Room'],
    status: 'occupied'
  },
  {
    id: '3',
    name: 'Shared House C',
    type: 'shared_house',
    capacity: 6,
    currentOccupancy: 3,
    address: '789 Residential St, Suburbs',
    amenities: ['WiFi', 'Garden', 'Full Kitchen', 'Living Room'],
    status: 'occupied'
  },
  {
    id: '4',
    name: 'Downtown Apartments D',
    type: 'apartment',
    capacity: 2,
    currentOccupancy: 0,
    address: '321 Business District',
    amenities: ['WiFi', 'Gym', 'Pool', 'Parking'],
    status: 'available'
  }
];

// Sample housing assignments
export const sampleHousingAssignments: HousingAssignment[] = [
  {
    id: '1',
    internId: '1',
    housingUnitId: '1',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    status: 'completed'
  },
  {
    id: '2',
    internId: '2',
    housingUnitId: '2',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    status: 'completed'
  },
  {
    id: '3',
    internId: '3',
    housingUnitId: '1',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    status: 'active'
  },
  {
    id: '4',
    internId: '4',
    housingUnitId: '3',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    status: 'active'
  }
];
