import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    console.log('=== SIMPLE DB CHECK ===');
    
    // Get all tables
    const tables = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables found:', tables);

    const result: any = { tables: tables };

    // Get columns for each table
    for (const table of tables) {
      const tableName = (table as any).table_name;
      try {
        const columns = await executeQuery(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);

        console.log(`Columns for ${tableName}:`, columns);
        result[tableName] = { columns };

        // Get first few rows to understand the data
        const sampleData = await executeQuery(`SELECT * FROM "${tableName}" LIMIT 2;`);
        result[tableName].sampleData = sampleData;
        console.log(`Sample data for ${tableName}:`, sampleData);

      } catch (error) {
        console.error(`Error with table ${tableName}:`, error);
        result[tableName] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Simple DB check error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'Simple DB Check Error'
    }, { status: 500 });
  }
}
