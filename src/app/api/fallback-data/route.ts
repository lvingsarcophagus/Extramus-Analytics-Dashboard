import { NextResponse } from 'next/server';

// This API endpoint provides a comprehensive set of fallback data
// when the database is not working properly
export async function GET() {
  console.log('=== FALLBACK DATA API ===');
  
  // Generate fallback data for all components
  
  // 1. Interns data
  const fallbackInterns = [
    {
      intern_id: "1",
      name: "Emma Rodriguez",
      email: "emma.rodriguez@university.edu",
      department_name: "Engineering",
      nationality: "USA",
      gender: "female",
      start_date: "2024-06-01",
      end_date: "2024-08-31",
      status: "completed",
      normalized_status: "completed",
      duration_days: 91
    },
    {
      intern_id: "2",
      name: "Raj Patel",
      email: "raj.patel@university.edu",
      department_name: "Data Science",
      nationality: "India",
      gender: "male",
      start_date: "2024-06-01",
      end_date: "2024-08-31",
      status: "completed",
      normalized_status: "completed",
      duration_days: 91
    },
    {
      intern_id: "3",
      name: "Sophie Miller",
      email: "sophie.miller@university.edu",
      department_name: "Marketing",
      nationality: "Germany",
      gender: "female",
      start_date: "2024-12-01",
      end_date: "2025-02-28",
      status: "active",
      normalized_status: "active",
      duration_days: 89
    },
    {
      intern_id: "4",
      name: "Kevin Wu",
      email: "kevin.wu@university.edu",
      department_name: "Engineering",
      nationality: "Canada",
      gender: "male",
      start_date: "2024-12-01",
      end_date: "2025-02-28",
      status: "active",
      normalized_status: "active",
      duration_days: 89
    },
    {
      intern_id: "5",
      name: "Maria Santos",
      email: "maria.santos@university.edu",
      department_name: "Finance",
      nationality: "Brazil",
      gender: "female",
      start_date: "2023-06-01",
      end_date: "2023-08-31",
      status: "completed",
      normalized_status: "completed",
      duration_days: 91
    }
  ];
  
  // 2. Department stats
  const fallbackDepartments = [
    {
      id: 1,
      name: "Engineering",
      count: 15,
      percentage: 30,
      color: "#4285F4"
    },
    {
      id: 2,
      name: "Data Science",
      count: 12,
      percentage: 24,
      color: "#EA4335"
    },
    {
      id: 3,
      name: "Marketing",
      count: 8,
      percentage: 16,
      color: "#FBBC05"
    },
    {
      id: 4,
      name: "Finance",
      count: 7,
      percentage: 14,
      color: "#34A853"
    },
    {
      id: 5,
      name: "Human Resources",
      count: 5,
      percentage: 10,
      color: "#00A0B0"
    },
    {
      id: 6,
      name: "Research",
      count: 3,
      percentage: 6,
      color: "#6A4A3C"
    }
  ];
  
  // 3. Housing data
  const fallbackHousing = [
    {
      apartment_id: 1,
      address: "123 University Ave",
      max_capacity: 4,
      total_rooms: 2,
      current_occupants: 3,
      available_capacity: 1
    },
    {
      apartment_id: 2,
      address: "456 College St",
      max_capacity: 6,
      total_rooms: 3,
      current_occupants: 6,
      available_capacity: 0
    },
    {
      apartment_id: 3,
      address: "789 Campus Way",
      max_capacity: 4,
      total_rooms: 2,
      current_occupants: 2,
      available_capacity: 2
    },
    {
      apartment_id: 4,
      address: "101 Research Park",
      max_capacity: 3,
      total_rooms: 2,
      current_occupants: 0,
      available_capacity: 3
    }
  ];
  
  // 4. Nationality distribution data
  const fallbackNationalities = [
    { nationality: "USA", count: 15, percentage: 30 },
    { nationality: "India", count: 12, percentage: 24 },
    { nationality: "China", count: 8, percentage: 16 },
    { nationality: "Germany", count: 6, percentage: 12 },
    { nationality: "Brazil", count: 5, percentage: 10 },
    { nationality: "Others", count: 4, percentage: 8 }
  ];
  
  // 5. Monthly trends data
  const fallbackMonthlyTrends = [
    { month: "Jan", interns: 12, housing: 10 },
    { month: "Feb", interns: 15, housing: 12 },
    { month: "Mar", interns: 18, housing: 15 },
    { month: "Apr", interns: 20, housing: 18 },
    { month: "May", interns: 25, housing: 22 },
    { month: "Jun", interns: 30, housing: 28 },
    { month: "Jul", interns: 28, housing: 26 },
    { month: "Aug", interns: 25, housing: 22 },
    { month: "Sep", interns: 20, housing: 18 },
    { month: "Oct", interns: 18, housing: 15 },
    { month: "Nov", interns: 15, housing: 12 },
    { month: "Dec", interns: 12, housing: 10 }
  ];
  
  // 6. Gender distribution data
  const fallbackGender = [
    { gender: "male", count: 28, percentage: 56 },
    { gender: "female", count: 20, percentage: 40 },
    { gender: "other", count: 2, percentage: 4 }
  ];
  
  // 7. Performance metrics data
  const fallbackPerformance = [
    { metric: "Work Quality", average: 4.2, max: 5 },
    { metric: "Communication", average: 3.8, max: 5 },
    { metric: "Technical Skills", average: 4.5, max: 5 },
    { metric: "Problem Solving", average: 4.0, max: 5 },
    { metric: "Team Collaboration", average: 4.3, max: 5 }
  ];
  
  // 8. Internship duration data
  const fallbackDurations = [
    { duration: "1-3 months", count: 15 },
    { duration: "3-6 months", count: 25 },
    { duration: "6-9 months", count: 8 },
    { duration: "9-12 months", count: 2 }
  ];
  
  // 9. Status statistics
  const fallbackStatus = {
    active: 25,
    completed: 20,
    pending: 5,
    terminated: 2,
    extended: 3
  };
  
  // Calculate department-wise intern stats
  const fallbackDeptStats = fallbackDepartments.map(dept => {
    return {
      name: dept.name,
      count: dept.count,
      active: Math.round(dept.count * 0.4),  // 40% active
      completed: Math.round(dept.count * 0.6) // 60% completed
    };
  });
  
  // Return comprehensive fallback data
  return NextResponse.json({
    success: true,
    source: 'fallback',
    data: {
      interns: {
        list: fallbackInterns,
        departmentStats: fallbackDeptStats,
        totalCount: fallbackInterns.length
      },
      departments: {
        departments: fallbackDepartments,
        totalDepartments: fallbackDepartments.length,
        totalInterns: fallbackDepartments.reduce((sum, dept) => sum + dept.count, 0)
      },
      housing: {
        apartments: fallbackHousing,
        statistics: {
          totalApartments: fallbackHousing.length,
          totalCapacity: fallbackHousing.reduce((sum, apt) => sum + apt.max_capacity, 0),
          totalOccupied: fallbackHousing.reduce((sum, apt) => sum + apt.current_occupants, 0),
          totalAvailable: fallbackHousing.reduce((sum, apt) => sum + apt.available_capacity, 0),
          occupancyRate: 70.6
        }
      },
      nationalities: {
        data: fallbackNationalities,
        totalNationalities: fallbackNationalities.length
      },
      trends: {
        monthly: fallbackMonthlyTrends
      },
      demographics: {
        gender: fallbackGender,
        performance: fallbackPerformance,
        durations: fallbackDurations,
        status: fallbackStatus
      }
    }
  });
}
