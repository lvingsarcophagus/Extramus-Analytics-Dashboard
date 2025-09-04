import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

export async function GET() {
  try {
    console.log('=== BASIC HOUSING API ===');
    
    // First, let's try the simplest possible query for accommodations table
    const basicHousing = await safeExecuteQuery(`
      SELECT * FROM accommodations LIMIT 10;
    `);

    console.log('Basic housing data:', basicHousing);

    if (basicHousing) {
      return NextResponse.json({
        success: true,
        source: 'database',
        data: basicHousing,
        count: basicHousing.length
      });
    }

    // Fallback to demo data if needed
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: [
        {
          id: 1,
          type: "Single Room",
          location: "Building A",
          status: "Occupied"
        }
      ],
      count: 1
    });

  } catch (error) {
    console.error('Basic housing API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
