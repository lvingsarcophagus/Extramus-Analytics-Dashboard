import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

// Modified version of the database utility that better handles connection errors
export async function GET() {
  try {
    console.log('=== DATABASE STATUS API (ADAPTED) ===');
    
    const results = {
      dbConnection: false,
      tableStatus: {},
      permissions: {},
      schemaInfo: {},
      recommendations: [],
      currentSettings: {},
      errors: []
    };
    
    try {
      // Check DB connection
      const connectionResult = await safeExecuteQuery('SELECT 1 as connection_test', []);
      results.dbConnection = connectionResult && connectionResult.length > 0 && 
                            connectionResult[0].connection_test === 1;
                            
      // Get database settings
      const dbConfigQuery = `
        SELECT 
          current_database() as db_name,
          current_user as db_user,
          current_setting('server_version') as pg_version
      `;
      const dbConfig = await safeExecuteQuery(dbConfigQuery, []);
      if (dbConfig && dbConfig.length > 0) {
        results.currentSettings = dbConfig[0];
      }
      
    } catch (error) {
      results.errors.push({
        type: 'connection',
        message: error instanceof Error ? error.message : String(error),
        code: error instanceof Error && 'code' in error ? (error as any).code : undefined
      });
      results.recommendations.push(
        'Check your database connection settings in env.local file',
        'Ensure the database server is running',
        'Verify the database user has proper connection privileges'
      );
      
      // Return early if we can't even connect
      return NextResponse.json(results);
    }
    
    // Check essential tables
    const requiredTables = [
      'intern_details', 
      'internship_info', 
      'departments', 
      'apartments', 
      'rooms', 
      'occupants'
    ];
    
    try {
      // Build query to check all tables at once
      const tableCheckQueries = requiredTables.map(
        table => `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}') as ${table}_exists`
      );
      const tableCheckQuery = tableCheckQueries.join(', ');
      
      const tableResults = await safeExecuteQuery(`SELECT ${tableCheckQuery}`, []);
      if (tableResults && tableResults.length > 0) {
        const tableStatus: Record<string, boolean> = {};
        
        requiredTables.forEach(table => {
          const exists = tableResults[0][`${table}_exists`];
          tableStatus[table] = exists;
          
          if (!exists) {
            results.recommendations.push(`Create the missing '${table}' table`);
          }
        });
        
        results.tableStatus = tableStatus;
      }
      
      // Get more detailed schema information for existing tables
      const schemaInfo: Record<string, any> = {};
      
      for (const table of requiredTables) {
        if (results.tableStatus[table]) {
          try {
            const tableSchema = await safeExecuteQuery(`
              SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_schema = 'public' AND table_name = $1
              ORDER BY ordinal_position
            `, [table]);
            
            schemaInfo[table] = tableSchema;
          } catch (error) {
            schemaInfo[table] = { error: String(error) };
          }
        }
      }
      
      results.schemaInfo = schemaInfo;
      
    } catch (error) {
      results.errors.push({
        type: 'schema',
        message: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check permissions on tables
    const permissions: Record<string, any> = {};
    
    for (const table of requiredTables) {
      if (results.tableStatus[table]) {
        try {
          // Try a simple SELECT query to check read permission
          const readCheck = await safeExecuteQuery(`SELECT 1 FROM ${table} LIMIT 1`, []);
          permissions[table] = { 
            read: true, 
            readDetail: 'Can read from table'
          };
        } catch (error) {
          permissions[table] = { 
            read: false, 
            readDetail: error instanceof Error ? error.message : String(error)
          };
          
          results.recommendations.push(`Grant SELECT permission on the '${table}' table to the current database user`);
        }
      }
    }
    
    results.permissions = permissions;
    
    // Add general recommendations if there are issues
    if (Object.values(results.permissions).some(p => !p.read)) {
      results.recommendations.push(
        'Run GRANT SELECT ON ALL TABLES IN SCHEMA public TO your_user;',
        'Ensure your database user has proper permissions'
      );
    }
    
    if (Object.values(results.tableStatus).some(exists => !exists)) {
      results.recommendations.push(
        'Create the missing tables using the appropriate schema definitions',
        'Consider running a database migration script if available'
      );
    }
    
    return NextResponse.json(results);

  } catch (error) {
    console.error('Database Status API error:', error);
    
    return NextResponse.json({
      dbConnection: false,
      error: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      recommendations: [
        'Check your database connection settings',
        'Ensure the database server is running',
        'Verify the database user has proper connection privileges'
      ]
    });
  }
}
