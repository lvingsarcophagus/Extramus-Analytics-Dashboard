import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

export async function GET() {
  try {
    // Get comprehensive database insights
    const insights = {
      tableSummary: [],
      dataQuality: [],
      relationships: [],
      performanceMetrics: []
    };

    // 1. Get table summary with row counts and basic statistics
    const tableSummary = await safeExecuteQuery(`
      SELECT 
        schemaname,
        tablename,
        (SELECT COUNT(*) FROM pg_stat_user_tables WHERE relname = tablename) as row_count,
        (SELECT n_tup_ins FROM pg_stat_user_tables WHERE relname = tablename) as inserts,
        (SELECT n_tup_upd FROM pg_stat_user_tables WHERE relname = tablename) as updates,
        (SELECT n_tup_del FROM pg_stat_user_tables WHERE relname = tablename) as deletes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    // 2. Get detailed column information for all tables
    const columnInfo = await safeExecuteQuery(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    // 3. Get foreign key relationships
    const relationships = await safeExecuteQuery(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public';
    `);

    // 4. Get sample data from each table with actual counts
    const tableData: Record<string, any> = {};
    
    for (const table of tableSummary) {
      const tableName = table.tablename as string;
      
      try {
        // Get actual row count
        const countResult = await safeExecuteQuery(`
          SELECT COUNT(*) as actual_count FROM "${tableName}";
        `);
        
        // Get sample data (first 5 rows)
        const sampleData = await safeExecuteQuery(`
          SELECT * FROM "${tableName}" LIMIT 5;
        `);
        
        // Get table columns for data quality analysis
        const tableColumns = columnInfo.filter((col: any) => col.table_name === tableName);
        
        // Analyze data quality for each column
        const dataQuality = [];
        for (const col of tableColumns) {
          const colName = col.column_name;
          
          try {
            const qualityResult = await safeExecuteQuery(`
              SELECT 
                '${colName}' as column_name,
                COUNT(*) as total_rows,
                COUNT("${colName}") as non_null_count,
                COUNT(*) - COUNT("${colName}") as null_count,
                ROUND(
                  (COUNT("${colName}") * 100.0 / COUNT(*)), 2
                ) as completeness_percentage
              FROM "${tableName}";
            `);
            
            if (qualityResult.length > 0) {
              dataQuality.push(qualityResult[0]);
            }
          } catch (colError) {
            console.warn(`Error analyzing column ${colName} in ${tableName}:`, colError);
          }
        }
        
        tableData[tableName] = {
          actualCount: countResult[0]?.actual_count || 0,
          sampleData: sampleData,
          columns: tableColumns,
          dataQuality: dataQuality,
          lastAnalyzed: new Date().toISOString()
        };
        
      } catch (tableError) {
        console.error(`Error analyzing table ${tableName}:`, tableError);
        tableData[tableName] = {
          error: `Failed to analyze table: ${tableError instanceof Error ? tableError.message : 'Unknown error'}`,
          actualCount: 0,
          sampleData: [],
          columns: [],
          dataQuality: []
        };
      }
    }

    // 5. Get database performance metrics
    const performanceMetrics = await safeExecuteQuery(`
      SELECT 
        schemaname,
        tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch,
        n_tup_ins,
        n_tup_upd,
        n_tup_del,
        n_tup_hot_upd,
        n_live_tup,
        n_dead_tup,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC;
    `);

    // 6. Get index information
    const indexInfo = await safeExecuteQuery(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTables: tableSummary.length,
          totalRelationships: relationships.length,
          totalIndexes: indexInfo.length,
          lastAnalyzed: new Date().toISOString()
        },
        tables: tableSummary.map((table: any) => ({
          ...table,
          ...tableData[table.tablename]
        })),
        columnInfo,
        relationships,
        performanceMetrics,
        indexInfo,
        tableData
      },
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        tablesAnalyzed: Object.keys(tableData).length,
        successfulAnalysis: Object.values(tableData).filter((t: any) => !t.error).length,
        failedAnalysis: Object.values(tableData).filter((t: any) => t.error).length
      }
    });

  } catch (error) {
    console.error('Enhanced database exploration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackData: {
        summary: {
          totalTables: 0,
          totalRelationships: 0,
          totalIndexes: 0,
          error: 'Database analysis failed'
        },
        tables: [],
        relationships: [],
        performanceMetrics: []
      }
    }, { status: 500 });
  }
}
