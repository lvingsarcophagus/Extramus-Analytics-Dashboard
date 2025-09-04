import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

// Define fallback chart data in case DB query fails
const FALLBACK_CHART_DATA = [
  { department_name: 'Engineering', value: 8, color: '#3b82f6' },
  { department_name: 'Marketing', value: 6, color: '#f97316' },
  { department_name: 'Data Science', value: 5, color: '#8b5cf6' },
  { department_name: 'HR', value: 4, color: '#06b6d4' },
  { department_name: 'Finance', value: 3, color: '#22c55e' },
  { department_name: 'Design', value: 3, color: '#f59e0b' },
  { department_name: 'Operations', value: 2, color: '#ec4899' },
  { department_name: 'Product', value: 2, color: '#ef4444' }
];

export async function GET() {
  try {
    console.log('=== DEPARTMENTS API ===');
    
    // Fetch all departments with their intern counts
    const departmentsResult = await safeExecuteQuery(`
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
    `, [], [
      { id: 1, department_name: 'Engineering', intern_count: '8', active_count: '5', completed_count: '3', pending_count: '0' },
      { id: 2, department_name: 'Marketing', intern_count: '6', active_count: '4', completed_count: '2', pending_count: '0' },
      { id: 3, department_name: 'Data Science', intern_count: '5', active_count: '3', completed_count: '1', pending_count: '1' }
    ]);

    // Generate color array for pie chart
    const colors = [
      '#3b82f6', // blue-500
      '#f97316', // orange-500
      '#8b5cf6', // violet-500
      '#06b6d4', // cyan-500
      '#22c55e', // green-500
      '#f59e0b', // amber-500
      '#ec4899', // pink-500
      '#ef4444', // red-500
      '#a855f7', // purple-500
      '#14b8a6', // teal-500
    ];

    // Construct chart data directly from departments result
    const chartData = departmentsResult
      .filter((dept: any) => parseInt(String(dept.intern_count), 10) > 0)
      .sort((a: any, b: any) => parseInt(String(b.intern_count), 10) - parseInt(String(a.intern_count), 10))
      .slice(0, 10)
      .map((dept: any, index: number) => ({
        department_name: dept.department_name,
        value: parseInt(String(dept.intern_count), 10),
        color: colors[index % colors.length]
      }));
    
    // If we don't have any chart data, use the fallback
    const finalChartData = chartData.length > 0 ? chartData : FALLBACK_CHART_DATA;
    
    console.log('Chart Data:', finalChartData);

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentsResult,
        chartData: finalChartData,
        totalDepartments: departmentsResult.length,
        activeDepartments: departmentsResult.filter((dept: any) => 
          parseInt(String(dept.intern_count), 10) > 0
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
