// Real-time analytics functions that fetch data from the database

export interface RealTimeMetrics {
  totalInterns: number;
  activeInterns: number;
  completedInterns: number;
  totalHousingUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
}

export interface DepartmentData {
  department: string;
  totalInterns: number;
  activeInterns: number;
  completedInterns: number;
}

export interface MonthlyData {
  month: string;
  internsStarted: number;
  internsCompleted: number;
}

export interface HousingData {
  apartmentName: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number;
}

// Fetch real-time intern data from API
export async function fetchRealTimeInternData() {
  try {
    const response = await fetch('/api/interns');
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch intern data');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching real-time intern data:', error);
    throw error;
  }
}

// Fetch real-time housing data from API
export async function fetchRealTimeHousingData() {
  try {
    const response = await fetch('/api/housing');
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch housing data');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching real-time housing data:', error);
    throw error;
  }
}

// Calculate real-time metrics
export async function calculateRealTimeMetrics(): Promise<RealTimeMetrics> {
  try {
    const [internData, housingData] = await Promise.all([
      fetchRealTimeInternData(),
      fetchRealTimeHousingData()
    ]);

    const totalInterns = internData.interns.length;
    const activeInterns = internData.interns.filter((intern: any) => 
      intern.normalized_status === 'active'
    ).length;
    const completedInterns = internData.interns.filter((intern: any) => 
      intern.normalized_status === 'completed'
    ).length;

    const occupancyStats = housingData.occupancyStats;
    const totalHousingUnits = parseInt(occupancyStats.total_rooms) || 0;
    const occupiedUnits = parseInt(occupancyStats.occupied_rooms) || 0;
    const occupancyRate = parseFloat(occupancyStats.occupancy_rate) || 0;

    return {
      totalInterns,
      activeInterns,
      completedInterns,
      totalHousingUnits,
      occupiedUnits,
      occupancyRate
    };
  } catch (error) {
    console.error('Error calculating real-time metrics:', error);
    // Return fallback data
    return {
      totalInterns: 0,
      activeInterns: 0,
      completedInterns: 0,
      totalHousingUnits: 0,
      occupiedUnits: 0,
      occupancyRate: 0
    };
  }
}

// Get department data for charts
export async function getDepartmentChartData(): Promise<DepartmentData[]> {
  try {
    const internData = await fetchRealTimeInternData();
    
    return internData.departmentStats.map((dept: any) => ({
      department: dept.department_name,
      totalInterns: parseInt(dept.intern_count) || 0,
      activeInterns: parseInt(dept.active_count) || 0,
      completedInterns: parseInt(dept.completed_count) || 0
    }));
  } catch (error) {
    console.error('Error getting department chart data:', error);
    return [];
  }
}

// Get monthly trend data
export async function getMonthlyTrendData(): Promise<MonthlyData[]> {
  try {
    const internData = await fetchRealTimeInternData();
    
    return internData.monthlyStats.map((month: any) => ({
      month: new Date(month.month).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      internsStarted: parseInt(month.interns_started) || 0,
      internsCompleted: parseInt(month.interns_completed) || 0
    }));
  } catch (error) {
    console.error('Error getting monthly trend data:', error);
    return [];
  }
}

// Get housing occupancy data
export async function getHousingOccupancyData(): Promise<HousingData[]> {
  try {
    const housingData = await fetchRealTimeHousingData();
    
    return housingData.apartmentStats.map((apt: any) => ({
      apartmentName: apt.apartment_name,
      totalRooms: parseInt(apt.total_rooms) || 0,
      occupiedRooms: parseInt(apt.occupied_rooms) || 0,
      availableRooms: parseInt(apt.available_rooms) || 0,
      occupancyRate: apt.total_rooms > 0 
        ? Math.round((parseInt(apt.occupied_rooms) / parseInt(apt.total_rooms)) * 100)
        : 0
    }));
  } catch (error) {
    console.error('Error getting housing occupancy data:', error);
    return [];
  }
}

// Filter data based on criteria (for compatibility with existing filter system)
export function filterData<T>(
  data: T[],
  filters: {
    departments?: string[];
    seasons?: string[];
    years?: string[];
  }
): T[] {
  // Since we're getting filtered data from the database,
  // this function can be used for client-side filtering if needed
  return data;
}
