import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

// Fallback demo data for when database is unavailable
const fallbackInternData = [
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
  }
];

const fallbackDepartmentStats = [
  { department_name: 'Engineering', intern_count: 5, active_count: 3, completed_count: 2 },
  { department_name: 'Marketing', intern_count: 3, active_count: 2, completed_count: 1 },
  { department_name: 'Sales', intern_count: 4, active_count: 3, completed_count: 1 }
];

const fallbackMonthlyStats = [
  { month: '2025-06-01', interns_started: 8, interns_completed: 2 },
  { month: '2025-07-01', interns_started: 6, interns_completed: 3 },
  { month: '2025-08-01', interns_started: 4, interns_completed: 1 }
];

export async function GET() {
  try {
    // Fetch intern data with department information
    const internsResult = await safeExecuteQuery(`
      SELECT
        id.intern_id,
        id.name,
        id.nationality,
        id.gender,
        id.birthdate,
        id.email,
        ii.department_id,
        d.department_name,
        ii.start_date,
        ii.end_date,
        ii.supervisor,
        ii.status as original_status,
        -- Dynamic status calculation based on dates
        CASE
          WHEN ii.end_date IS NULL THEN 'pending'
          WHEN ii.start_date IS NULL THEN 'pending'
          WHEN CURRENT_DATE < ii.start_date THEN 'pending'
          WHEN CURRENT_DATE > ii.end_date THEN 'completed'
          WHEN CURRENT_DATE BETWEEN ii.start_date AND ii.end_date THEN 'active'
          ELSE 'pending'
        END as calculated_status,
        -- Use calculated status as the main status
        CASE
          WHEN ii.end_date IS NULL THEN 'pending'
          WHEN ii.start_date IS NULL THEN 'pending'
          WHEN CURRENT_DATE < ii.start_date THEN 'pending'
          WHEN CURRENT_DATE > ii.end_date THEN 'completed'
          WHEN CURRENT_DATE BETWEEN ii.start_date AND ii.end_date THEN 'active'
          ELSE 'pending'
        END as status,
        CASE
          WHEN ii.end_date IS NULL THEN 'pending'
          WHEN ii.start_date IS NULL THEN 'pending'
          WHEN CURRENT_DATE < ii.start_date THEN 'pending'
          WHEN CURRENT_DATE > ii.end_date THEN 'completed'
          WHEN CURRENT_DATE BETWEEN ii.start_date AND ii.end_date THEN 'active'
          ELSE 'pending'
        END as normalized_status
      FROM intern_details id
      LEFT JOIN internship_info ii ON id.intern_id = ii.intern_id
      LEFT JOIN departments d ON ii.department_id = d.id
      ORDER BY id.intern_id;
    `, [], fallbackInternData);

    // Get department statistics with calculated status
    const departmentStatsResult = await safeExecuteQuery(`
      SELECT
        d.department_name,
        COUNT(ii.intern_id) as intern_count,
        COUNT(CASE
          WHEN ii.end_date IS NULL THEN NULL
          WHEN ii.start_date IS NULL THEN NULL
          WHEN CURRENT_DATE < ii.start_date THEN NULL
          WHEN CURRENT_DATE > ii.end_date THEN NULL
          WHEN CURRENT_DATE BETWEEN ii.start_date AND ii.end_date THEN 1
          ELSE NULL
        END) as active_count,
        COUNT(CASE
          WHEN ii.end_date IS NULL THEN NULL
          WHEN ii.start_date IS NULL THEN NULL
          WHEN CURRENT_DATE > ii.end_date THEN 1
          ELSE NULL
        END) as completed_count
      FROM departments d
      LEFT JOIN internship_info ii ON d.id = ii.department_id
      GROUP BY d.id, d.department_name
      HAVING COUNT(ii.intern_id) > 0
      ORDER BY intern_count DESC;
    `, [], fallbackDepartmentStats);

    // Get monthly statistics with calculated status
    const monthlyStatsResult = await safeExecuteQuery(`
      SELECT
        DATE_TRUNC('month', start_date) as month,
        COUNT(*) as interns_started,
        COUNT(CASE
          WHEN end_date IS NOT NULL AND CURRENT_DATE > end_date THEN 1
          ELSE NULL
        END) as interns_completed
      FROM internship_info
      WHERE start_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', start_date)
      ORDER BY month;
    `, [], fallbackMonthlyStats);

    return NextResponse.json({
      success: true,
      data: {
        interns: internsResult,
        departmentStats: departmentStatsResult,
        monthlyStats: monthlyStatsResult
      }
    });

  } catch (error) {
    console.error('Error fetching intern data:', error);

    // Return fallback data if database is completely unavailable
    return NextResponse.json({
      success: true,
      data: {
        interns: fallbackInternData,
        departmentStats: fallbackDepartmentStats,
        monthlyStats: fallbackMonthlyStats
      }
    });
  }
}
