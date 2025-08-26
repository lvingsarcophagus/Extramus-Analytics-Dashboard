import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
