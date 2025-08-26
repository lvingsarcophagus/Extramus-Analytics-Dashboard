import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Fetch intern data with department information
    const internsResult = await executeQuery(`
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
    `);

    // Get department statistics with calculated status
    const departmentStatsResult = await executeQuery(`
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
    `);

    // Get monthly statistics with calculated status
    const monthlyStatsResult = await executeQuery(`
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
    `);

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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
