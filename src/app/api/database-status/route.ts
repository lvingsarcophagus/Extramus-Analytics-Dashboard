"use server";

import { checkDatabaseAvailability } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isAvailable = await checkDatabaseAvailability();
    return NextResponse.json({
      available: isAvailable,
      status: isAvailable ? 'connected' : 'disconnected'
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
