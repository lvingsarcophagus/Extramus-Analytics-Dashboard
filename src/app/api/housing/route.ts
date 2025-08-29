import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

// Fallback demo data for when database is unavailable
const fallbackHousingData = [
  {
    apartment_id: 1,
    apartment_name: 'Building A',
    room_id: 1,
    room_number: '101',
    is_single: true,
    is_full: false,
    status: 'available',
    current_occupants: 0
  },
  {
    apartment_id: 1,
    apartment_name: 'Building A',
    room_id: 2,
    room_number: '102',
    is_single: false,
    is_full: true,
    status: 'occupied',
    current_occupants: 2
  },
  {
    apartment_id: 2,
    apartment_name: 'Building B',
    room_id: 3,
    room_number: '201',
    is_single: true,
    is_full: true,
    status: 'occupied',
    current_occupants: 1
  }
];

const fallbackOccupancyStats = {
  total_rooms: 15,
  occupied_rooms: 8,
  available_rooms: 7,
  single_rooms: 6,
  double_rooms: 9,
  occupancy_rate: 53.3
};

const fallbackApartmentStats = [
  { apartment_name: 'Building A', total_rooms: 8, occupied_rooms: 4, available_rooms: 4 },
  { apartment_name: 'Building B', total_rooms: 7, occupied_rooms: 4, available_rooms: 3 }
];

export async function GET() {
  try {
    // Fetch housing data - apartments, rooms, and occupancy
    const housingResult = await safeExecuteQuery(`
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
    `, [], fallbackHousingData);

    // Get occupancy statistics
    const occupancyStatsResult = await safeExecuteQuery(`
      SELECT
        COUNT(*) as total_rooms,
        COUNT(CASE WHEN is_full THEN 1 END) as occupied_rooms,
        COUNT(CASE WHEN NOT is_full THEN 1 END) as available_rooms,
        COUNT(CASE WHEN is_single THEN 1 END) as single_rooms,
        COUNT(CASE WHEN NOT is_single THEN 1 END) as double_rooms,
        ROUND((COUNT(CASE WHEN is_full THEN 1 END)::decimal / COUNT(*)) * 100, 1) as occupancy_rate
      FROM rooms;
    `, [], [fallbackOccupancyStats]);

    // Get apartment statistics
    const apartmentStatsResult = await safeExecuteQuery(`
      SELECT
        a.apartment_name,
        COUNT(r.id) as total_rooms,
        COUNT(CASE WHEN r.is_full THEN 1 END) as occupied_rooms,
        COUNT(CASE WHEN NOT r.is_full THEN 1 END) as available_rooms
      FROM apartments a
      LEFT JOIN rooms r ON a.id = r.apartment_id
      GROUP BY a.id, a.apartment_name
      ORDER BY a.apartment_name;
    `, [], fallbackApartmentStats);

    return NextResponse.json({
      success: true,
      data: {
        housing: housingResult,
        occupancyStats: occupancyStatsResult[0] || fallbackOccupancyStats,
        apartmentStats: apartmentStatsResult
      }
    });

  } catch (error) {
    console.error('Error fetching housing data:', error);

    // Return fallback data if database is completely unavailable
    return NextResponse.json({
      success: true,
      data: {
        housing: fallbackHousingData,
        occupancyStats: fallbackOccupancyStats,
        apartmentStats: fallbackApartmentStats
      }
    });
  }
}
