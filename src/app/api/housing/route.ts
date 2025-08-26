import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Fetch housing data - apartments, rooms, and occupancy
    const housingResult = await executeQuery(`
      SELECT 
        a.id as apartment_id,
        a.apartment_name,
        r.id as room_id,
        r.room_number,
        r.is_single,
        r.is_full,
        CASE WHEN r.is_full THEN 'occupied' ELSE 'available' END as status,
        COUNT(o.intern_id) as current_occupants
      FROM apartments a
      LEFT JOIN rooms r ON a.id = r.apartment_id
      LEFT JOIN occupants o ON r.id = o.room_id
      GROUP BY a.id, a.apartment_name, r.id, r.room_number, r.is_single, r.is_full
      ORDER BY a.apartment_name, r.room_number;
    `);

    // Get occupancy statistics
    const occupancyStatsResult = await executeQuery(`
      SELECT 
        COUNT(*) as total_rooms,
        COUNT(CASE WHEN is_full THEN 1 END) as occupied_rooms,
        COUNT(CASE WHEN NOT is_full THEN 1 END) as available_rooms,
        COUNT(CASE WHEN is_single THEN 1 END) as single_rooms,
        COUNT(CASE WHEN NOT is_single THEN 1 END) as double_rooms,
        ROUND((COUNT(CASE WHEN is_full THEN 1 END)::decimal / COUNT(*)) * 100, 1) as occupancy_rate
      FROM rooms;
    `);

    // Get apartment statistics
    const apartmentStatsResult = await executeQuery(`
      SELECT 
        a.apartment_name,
        COUNT(r.id) as total_rooms,
        COUNT(CASE WHEN r.is_full THEN 1 END) as occupied_rooms,
        COUNT(CASE WHEN NOT r.is_full THEN 1 END) as available_rooms
      FROM apartments a
      LEFT JOIN rooms r ON a.id = r.apartment_id
      GROUP BY a.id, a.apartment_name
      ORDER BY a.apartment_name;
    `);

    return NextResponse.json({
      success: true,
      data: {
        housing: housingResult,
        occupancyStats: occupancyStatsResult[0] || {
          total_rooms: 0,
          occupied_rooms: 0,
          available_rooms: 0,
          single_rooms: 0,
          double_rooms: 0,
          occupancy_rate: 0
        },
        apartmentStats: apartmentStatsResult
      }
    });

  } catch (error) {
    console.error('Error fetching housing data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
