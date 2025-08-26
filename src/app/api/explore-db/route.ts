import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // Get all tables in the database
    const tablesResult = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult;
    const tableInfo: Record<string, unknown> = {};

    // For each table, get column information and sample data
    for (const table of tables) {
      const tableName = (table as Record<string, unknown>).table_name as string;
      
      try {
        // Get column info
        const columnsResult = await executeQuery(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);

        // Get sample data (first 3 rows)
        const sampleResult = await executeQuery(`
          SELECT * FROM "${tableName}" LIMIT 3;
        `);

        // Get row count
        const countResult = await executeQuery(`
          SELECT COUNT(*) as count FROM "${tableName}";
        `);

        tableInfo[tableName] = {
          columns: columnsResult,
          sampleData: sampleResult,
          rowCount: (countResult[0] as Record<string, unknown>)?.count || 0
        };
      } catch (tableError) {
        console.error(`Error processing table ${tableName}:`, tableError);
        tableInfo[tableName] = {
          error: `Failed to process table: ${tableError instanceof Error ? tableError.message : 'Unknown error'}`
        };
      }
    }

    return NextResponse.json({
      success: true,
      tables: tables.map((t: Record<string, unknown>) => t.table_name),
      tableInfo
    });

  } catch (error) {
    console.error('Database exploration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
