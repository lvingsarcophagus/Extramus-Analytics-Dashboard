import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Fetch all departments with their intern counts
    const departmentsResult = await executeQuery(`
      SELECT 
        d.id,
        d.department_name,
        COUNT(ii.intern_id) as intern_count,
        COUNT(CASE WHEN ii.status = 'Active' THEN 1 END) as active_count,
        COUNT(CASE WHEN ii.status = 'Completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN ii.status NOT IN ('Active', 'Completed') OR ii.status IS NULL THEN 1 END) as pending_count
      FROM departments d
      LEFT JOIN internship_info ii ON d.id = ii.department_id
      GROUP BY d.id, d.department_name
      ORDER BY intern_count DESC, d.department_name ASC;
    `);

    // Get department statistics for pie chart
    const departmentStatsForChart = await executeQuery(`
      SELECT 
        d.department_name,
        COUNT(ii.intern_id) as value,
        CASE 
          WHEN COUNT(ii.intern_id) = 0 THEN '#e5e7eb'
          WHEN COUNT(ii.intern_id) <= 1 THEN '#fef3c7'
          WHEN COUNT(ii.intern_id) <= 3 THEN '#ddd6fe'
          WHEN COUNT(ii.intern_id) <= 5 THEN '#bfdbfe'
          ELSE '#bbf7d0'
        END as color
      FROM departments d
      LEFT JOIN internship_info ii ON d.id = ii.department_id
      GROUP BY d.id, d.department_name
      HAVING COUNT(ii.intern_id) > 0
      ORDER BY COUNT(ii.intern_id) DESC
      LIMIT 10;
    `);

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentsResult,
        chartData: departmentStatsForChart,
        totalDepartments: departmentsResult.length,
        activeDepartments: departmentsResult.filter(dept => 
          parseInt(String((dept as Record<string, unknown>).intern_count)) > 0
        ).length
      }
    });

  } catch (error) {
    console.error('Error fetching departments data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
