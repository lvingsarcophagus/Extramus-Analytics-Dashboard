import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Look specifically for interns with mismatched status
    const result = await executeQuery(`
      SELECT 
        id.intern_id,
        id.name,
        ii.start_date,
        ii.end_date,
        ii.status as database_status,
        CURRENT_DATE as today,
        CASE 
          WHEN ii.end_date IS NULL THEN 'pending (no end date)'
          WHEN ii.start_date IS NULL THEN 'pending (no start date)'
          WHEN CURRENT_DATE < ii.start_date THEN 'pending (not started)'
          WHEN CURRENT_DATE > ii.end_date THEN 'completed (past end date)'
          WHEN CURRENT_DATE BETWEEN ii.start_date AND ii.end_date THEN 'active (in progress)'
          ELSE 'pending (unknown)'
        END as calculated_status_explanation,
        CASE 
          WHEN ii.end_date IS NULL THEN 'pending'
          WHEN ii.start_date IS NULL THEN 'pending'
          WHEN CURRENT_DATE < ii.start_date THEN 'pending'
          WHEN CURRENT_DATE > ii.end_date THEN 'completed'
          WHEN CURRENT_DATE BETWEEN ii.start_date AND ii.end_date THEN 'active'
          ELSE 'pending'
        END as calculated_status,
        CASE 
          WHEN ii.status = 'Active' THEN 'active'
          WHEN ii.status = 'Completed' THEN 'completed'
          ELSE 'pending'
        END as normalized_database_status,
        -- Flag mismatches
        CASE 
          WHEN ii.status = 'Active' AND CURRENT_DATE > ii.end_date THEN 'PROBLEM: DB says Active but should be Completed'
          WHEN ii.status = 'Completed' AND CURRENT_DATE <= ii.end_date THEN 'PROBLEM: DB says Completed but should be Active'
          WHEN ii.status = 'Active' AND CURRENT_DATE < ii.start_date THEN 'PROBLEM: DB says Active but should be Pending'
          ELSE 'OK'
        END as status_mismatch
      FROM intern_details id
      LEFT JOIN internship_info ii ON id.intern_id = ii.intern_id
      WHERE ii.intern_id IS NOT NULL
      ORDER BY 
        CASE WHEN ii.status = 'Active' AND CURRENT_DATE > ii.end_date THEN 1 ELSE 2 END,
        ii.end_date DESC NULLS LAST
      LIMIT 20;
    `);

    return NextResponse.json({
      success: true,
      explanation: "Looking for status mismatches where database status doesn't match calculated status",
      today: new Date().toISOString().split('T')[0],
      currentServerDate: new Date().toISOString(),
      data: result
    });

  } catch (error) {
    console.error('Error in status debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
