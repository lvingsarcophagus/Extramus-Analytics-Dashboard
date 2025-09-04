import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

export async function GET() {
  try {
    console.log('=== BASIC DEPARTMENTS API ===');
    
    // First, let's try the simplest possible query for departments table
    const basicDepartments = await safeExecuteQuery(`
      SELECT * FROM departments LIMIT 10;
    `);

    console.log('Basic departments data:', basicDepartments);

    if (basicDepartments) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: basicDepartments,
        count: basicDepartments.length
      });
    }

    // Fallback to demo data if needed
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: [
        {
          id: 1,
          name: "Technology",
          description: "IT Department"
        }
      ],
      count: 1
    });

  } catch (error) {
    console.error('Basic departments API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
