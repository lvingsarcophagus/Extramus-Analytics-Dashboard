import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';
import { sampleInterns } from '@/lib/data/sample-data';

export async function GET() {
  try {
    console.log('=== INTERNS API ===');
    
    // Get intern details joined with internship info and departments
    const internsQuery = `
      SELECT 
        id.intern_id,
        id.name,
        id.nationality,
        id.gender,
        id.birthdate,
        id.email,
        id.phone,
        ii.start_date,
        ii.end_date,
        ii.supervisor,
        ii.status,
        d.department_name
      FROM 
        intern_details id
      LEFT JOIN 
        internship_info ii ON id.intern_id = ii.intern_id
      LEFT JOIN 
        departments d ON ii.department_id = d.id
      ORDER BY 
        id.intern_id
    `;
    
    const interns = await safeExecuteQuery(internsQuery, [], 
      sampleInterns.map(intern => ({
        intern_id: intern.id,
        name: intern.name,
        nationality: intern.nationality,
        gender: intern.gender,
        email: intern.email,
        department_name: intern.department,
        start_date: intern.startDate,
        end_date: intern.endDate,
        status: intern.status
      }))
    );
    
    // Process interns to normalize data
    const processedInterns = interns.map((intern: any) => {
      // Create a normalized status field
      const normalizedStatus = intern.status?.toLowerCase() || 'unknown';
      
      // Calculate duration in days (if dates are available)
      let durationDays = null;
      if (intern.start_date && intern.end_date) {
        const start = new Date(intern.start_date);
        const end = new Date(intern.end_date);
        durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      }
      
      return {
        ...intern,
        normalized_status: normalizedStatus,
        duration_days: durationDays
      };
    });
    
    // Group interns by department for statistics
    const departments = new Map();
    processedInterns.forEach((intern: any) => {
      const dept = intern.department_name || 'Unassigned';
      if (!departments.has(dept)) {
        departments.set(dept, { 
          name: dept, 
          count: 0,
          active: 0,
          completed: 0
        });
      }
      
      const deptStats = departments.get(dept);
      deptStats.count++;
      
      if (intern.normalized_status === 'active') {
        deptStats.active++;
      } else if (intern.normalized_status === 'completed') {
        deptStats.completed++;
      }
    });
    
    const departmentStats = Array.from(departments.values());
    
    // Return processed data
    return NextResponse.json({
      success: true,
      source: interns.length === 0 ? 'sample' : 'database',
      data: {
        interns: processedInterns,
        departmentStats,
        totalCount: processedInterns.length
      }
    });

  } catch (error) {
    console.error('Interns API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
