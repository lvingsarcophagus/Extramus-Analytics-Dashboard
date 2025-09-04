import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';
import { sampleHousingUnits } from '@/lib/data/sample-data';

export async function GET() {
  try {
    console.log('=== HOUSING API (FALLBACK) ===');
    
    // First, check if apartments and rooms tables exist
    let apartmentsQuery = `
      SELECT 
        a.id as apartment_id,
        a.apartment_name,
        r.id as room_id,
        r.room_number,
        r.is_single,
        r.is_full,
        0 as occupants_count
      FROM 
        apartments a
      LEFT JOIN 
        rooms r ON a.id = r.apartment_id
      ORDER BY 
        a.apartment_name, r.room_number
    `;
    
    // Try the query that doesn't rely on occupants table
    const housingData = await safeExecuteQuery(apartmentsQuery, [], 
      sampleHousingUnits.map(unit => ({
        apartment_id: unit.id,
        apartment_name: unit.name,
        room_id: null,
        room_number: null,
        is_single: unit.type === 'dormitory',
        is_full: unit.currentOccupancy >= unit.capacity,
        occupants_count: unit.currentOccupancy
      }))
    );
    
    // Process and organize data without relying on occupants
    const apartments = new Map();
    const rooms = new Map();
    let totalRooms = 0;
    let occupiedRooms = 0;
    
    housingData.forEach((row: any) => {
      // Add apartment if not exists
      if (!apartments.has(row.apartment_id)) {
        apartments.set(row.apartment_id, {
          id: row.apartment_id,
          apartment_name: row.apartment_name,
          rooms: [],
          total_rooms: 0,
          occupied_rooms: 0
        });
      }
      
      // Add room if we have room data
      if (row.room_id) {
        totalRooms++;
        if (row.is_full) {
          occupiedRooms++;
        }
        
        // Add room to apartment
        const apartment = apartments.get(row.apartment_id);
        apartment.total_rooms++;
        if (row.is_full) {
          apartment.occupied_rooms++;
        }
        
        // Create room object without occupants (since we don't have that data)
        const room = {
          id: row.room_id,
          room_number: row.room_number,
          is_single: row.is_single,
          is_full: row.is_full,
          occupants: [] // Empty since we can't access occupants table
        };
        
        // Add room to map and to apartment
        rooms.set(row.room_id, room);
        apartment.rooms.push(room);
      }
    });
    
    // Calculate statistics
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    // Return processed data
    return NextResponse.json({
      success: true,
      source: housingData.length === 0 ? 'sample' : 'database',
      data: {
        apartments: Array.from(apartments.values()),
        occupancyStats: {
          total_rooms: totalRooms,
          occupied_rooms: occupiedRooms,
          occupancy_rate: occupancyRate
        }
      }
    });

  } catch (error) {
    console.error('Housing API (fallback) error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
