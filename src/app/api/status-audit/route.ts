import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Find all interns with status mismatches
    const problemRecords = await executeQuery(`
      SELECT 
        id.intern_id,
        id.name,
        ii.start_date,
        ii.end_date,
        ii.status as database_status,
        CURRENT_DATE as today,
        CASE 
          WHEN ii.end_date IS NULL THEN 'pending'
          WHEN ii.start_date IS NULL THEN 'pending'
          WHEN CURRENT_DATE < ii.start_date THEN 'pending'
          WHEN CURRENT_DATE > ii.end_date THEN 'completed'
          WHEN CURRENT_DATE BETWEEN ii.start_date AND ii.end_date THEN 'active'
          ELSE 'pending'
        END as correct_status,
        CASE 
          WHEN ii.status = 'Active' AND CURRENT_DATE > ii.end_date THEN 'Should be Completed'
          WHEN ii.status = 'Completed' AND CURRENT_DATE <= ii.end_date AND CURRENT_DATE >= ii.start_date THEN 'Should be Active'
          WHEN ii.status = 'Active' AND CURRENT_DATE < ii.start_date THEN 'Should be Pending'
          ELSE NULL
        END as issue_description
      FROM intern_details id
      LEFT JOIN internship_info ii ON id.intern_id = ii.intern_id
      WHERE ii.intern_id IS NOT NULL
        AND (
          (ii.status = 'Active' AND CURRENT_DATE > ii.end_date) OR
          (ii.status = 'Completed' AND CURRENT_DATE <= ii.end_date AND CURRENT_DATE >= ii.start_date) OR
          (ii.status = 'Active' AND CURRENT_DATE < ii.start_date)
        )
      ORDER BY ii.end_date DESC;
    `);

    // Get summary statistics
    const summary = await executeQuery(`
      SELECT 
        COUNT(*) as total_mismatches,
        COUNT(CASE WHEN ii.status = 'Active' AND CURRENT_DATE > ii.end_date THEN 1 END) as active_should_be_completed,
        COUNT(CASE WHEN ii.status = 'Completed' AND CURRENT_DATE <= ii.end_date AND CURRENT_DATE >= ii.start_date THEN 1 END) as completed_should_be_active,
        COUNT(CASE WHEN ii.status = 'Active' AND CURRENT_DATE < ii.start_date THEN 1 END) as active_should_be_pending
      FROM intern_details id
      LEFT JOIN internship_info ii ON id.intern_id = ii.intern_id
      WHERE ii.intern_id IS NOT NULL
        AND (
          (ii.status = 'Active' AND CURRENT_DATE > ii.end_date) OR
          (ii.status = 'Completed' AND CURRENT_DATE <= ii.end_date AND CURRENT_DATE >= ii.start_date) OR
          (ii.status = 'Active' AND CURRENT_DATE < ii.start_date)
        );
    `);

    return NextResponse.json({
      success: true,
      explanation: "This endpoint shows all interns whose database status doesn't match their calculated status based on dates",
      timestamp: new Date().toISOString(),
      summary: summary[0] || {},
      problemRecords: problemRecords,
      recommendation: "The main interns API has been updated to use calculated status, so these issues are now automatically resolved in the application."
    });

  } catch (error) {
    console.error('Error in status audit:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Optional: POST endpoint to fix database status (uncomment if needed)
/*
export async function POST() {
  try {
    const updateResult = await executeQuery(`
      UPDATE internship_info 
      SET status = CASE 
        WHEN end_date IS NULL THEN 'Pending'
        WHEN start_date IS NULL THEN 'Pending'
        WHEN CURRENT_DATE < start_date THEN 'Pending'
        WHEN CURRENT_DATE > end_date THEN 'Completed'
        WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN 'Active'
        ELSE 'Pending'
      END
      WHERE (
        (status = 'Active' AND CURRENT_DATE > end_date) OR
        (status = 'Completed' AND CURRENT_DATE <= end_date AND CURRENT_DATE >= start_date) OR
        (status = 'Active' AND CURRENT_DATE < start_date)
      );
    `);

    return NextResponse.json({
      success: true,
      message: "Database status fields have been updated to match calculated status",
      updatedRecords: updateResult
    });

  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
*/
