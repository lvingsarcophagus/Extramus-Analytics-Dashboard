import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';
import { sampleInterns } from '@/lib/data/sample-data';
import { processDbError } from '@/lib/db-error-handler';

export async function GET() {
  try {
    console.log('=== INTERNS API (FALLBACK) ===');
    
    // First, check which tables we can access
    // We'll try each table separately to diagnose issues
    let tableStatus = {
      intern_details: false,
      internship_info: false,
      departments: false
    };
    
    try {
      await safeExecuteQuery('SELECT COUNT(*) FROM intern_details LIMIT 1', []);
      tableStatus.intern_details = true;
    } catch (error) {
      const dbError = processDbError(error);
      console.warn(`Intern details table error: ${dbError.human_readable}`);
    }
    
    try {
      await safeExecuteQuery('SELECT COUNT(*) FROM internship_info LIMIT 1', []);
      tableStatus.internship_info = true;
    } catch (error) {
      const dbError = processDbError(error);
      console.warn(`Internship info table error: ${dbError.human_readable}`);
    }
    
    try {
      await safeExecuteQuery('SELECT COUNT(*) FROM departments LIMIT 1', []);
      tableStatus.departments = true;
    } catch (error) {
      const dbError = processDbError(error);
      console.warn(`Departments table error: ${dbError.human_readable}`);
    }
    
    // Construct a query based on which tables are accessible
    let internsQuery = '';
    if (tableStatus.intern_details && tableStatus.internship_info && tableStatus.departments) {
      // All tables are accessible - use the full join
      internsQuery = `
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
    } else if (tableStatus.intern_details && tableStatus.internship_info) {
      // Intern details and internship info accessible - exclude departments
      internsQuery = `
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
          NULL as department_name
        FROM 
          intern_details id
        LEFT JOIN 
          internship_info ii ON id.intern_id = ii.intern_id
        ORDER BY 
          id.intern_id
      `;
    } else if (tableStatus.intern_details) {
      // Only intern details accessible - basic query
      internsQuery = `
        SELECT 
          intern_id,
          name,
          nationality,
          gender,
          birthdate,
          email,
          phone,
          NULL as start_date,
          NULL as end_date,
          NULL as supervisor,
          NULL as status,
          NULL as department_name
        FROM 
          intern_details
        ORDER BY 
          intern_id
      `;
    } else {
      // No tables accessible - return fallback data immediately
      const processedInterns = processSampleData();
      return createSuccessResponse(processedInterns, true);
    }
    
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
    const processedInterns = processInterns(interns);
    
    // Return processed data
    return createSuccessResponse(processedInterns, interns.length === 0);

  } catch (error) {
    console.error('Interns API (fallback) error:', error);
    
    // Return sample data as a fallback when any error occurs
    const processedInterns = processSampleData();
    
    // Return the processed sample data with indication it's sample data
    return createSuccessResponse(processedInterns, true, 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Process the interns data to normalize fields and add calculated properties
 */
function processInterns(interns: any[]) {
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
  
  return {
    interns: processedInterns,
    departmentStats,
    totalCount: processedInterns.length
  };
}

/**
 * Process the sample data as a fallback
 */
function processSampleData() {
  return processInterns(
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
}

/**
 * Create a standardized success response
 */
function createSuccessResponse(data: any, isSample: boolean, warning?: string) {
  return NextResponse.json({
    success: true,
    source: isSample ? 'sample' : 'database',
    warning,
    data
  });
}
