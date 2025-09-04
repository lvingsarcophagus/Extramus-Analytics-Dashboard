import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

export async function GET() {
  try {
    console.log('=== BASIC INTERNS API ===');
    
    // First, let's try the simplest possible query
    const basicInterns = await safeExecuteQuery(`
      SELECT * FROM interns LIMIT 10;
    `);

    console.log('Basic interns data:', basicInterns);

    if (basicInterns) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: basicInterns,
        count: basicInterns.length
      });
    }

    // Fallback to demo data if needed
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: [
        {
          id: 1,
          name: "Jane Smith",
          email: "jane.smith@email.com",
          department: "Marketing",
          status: "Active"
        }
      ],
      count: 1
    });

  } catch (error) {
    console.error('Basic interns API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
