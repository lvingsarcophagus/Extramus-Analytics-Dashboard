import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    const diagnosticResults: Record<string, any> = {
      databaseConnection: false,
      systemInfo: {},
      tablesInfo: {},
      permissionIssues: [],
      missingTables: [],
      suggestedFixes: []
    };

    // Step 1: Test basic database connection
    try {
      const connectionTest = await executeQuery('SELECT NOW() as current_time');
      diagnosticResults.databaseConnection = true;
      diagnosticResults.systemInfo.currentTime = connectionTest[0]?.current_time;
    } catch (connError: any) {
      diagnosticResults.connectionError = connError?.message || 'Unknown connection error';
      // If we can't connect, we can't continue with other checks
      return NextResponse.json({
        success: false,
        ...diagnosticResults
      }, { status: 500 });
    }

    // Step 2: Get database version and user information
    try {
      const versionInfo = await executeQuery('SELECT version() as version, current_user, current_database()');
      diagnosticResults.systemInfo.version = versionInfo[0]?.version;
      diagnosticResults.systemInfo.user = versionInfo[0]?.current_user;
      diagnosticResults.systemInfo.database = versionInfo[0]?.current_database;
    } catch (versionError) {
      diagnosticResults.systemInfo.error = 'Failed to retrieve version info';
    }

    // Step 3: Check expected tables existence
    const expectedTables = [
      'intern_details', 
      'internship_info', 
      'departments', 
      'apartments', 
      'rooms', 
      'occupants'
    ];
    
    // Get all existing tables
    try {
      const tablesResult = await executeQuery(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      const existingTables = tablesResult.map((t: any) => t.table_name);
      diagnosticResults.tablesInfo.existingTables = existingTables;
      
      // Check for missing tables
      const missing = expectedTables.filter(table => !existingTables.includes(table));
      diagnosticResults.missingTables = missing;
      
      if (missing.length > 0) {
        diagnosticResults.suggestedFixes.push({
          issue: `Missing tables: ${missing.join(', ')}`,
          solution: 'Create the missing tables or update queries to work with existing schema'
        });
      }
    } catch (tablesError) {
      diagnosticResults.tablesInfo.error = 'Failed to list tables';
    }

    // Step 4: Check permissions for each expected table
    for (const tableName of expectedTables) {
      try {
        // Skip permission checks for tables we already know are missing
        if (diagnosticResults.missingTables.includes(tableName)) {
          continue;
        }
        
        // Try to select from the table (with limit 0 to minimize data transfer)
        await executeQuery(`SELECT * FROM ${tableName} LIMIT 0`);
        
        // If successful, now check specific permissions
        const permissionsResult = await executeQuery(`
          SELECT grantee, privilege_type 
          FROM information_schema.role_table_grants 
          WHERE table_name = $1
        `, [tableName]);
        
        diagnosticResults.tablesInfo[tableName] = {
          exists: true,
          permissions: permissionsResult
        };
      } catch (tableError: any) {
        const errorMsg = tableError?.message || 'Unknown table error';
        
        // Track the permission issues
        if (errorMsg.includes('permission denied') || errorMsg.includes('does not exist')) {
          diagnosticResults.permissionIssues.push({
            table: tableName,
            error: errorMsg
          });
          
          diagnosticResults.suggestedFixes.push({
            issue: `Permission issue with table "${tableName}": ${errorMsg}`,
            solution: errorMsg.includes('permission denied') 
              ? `GRANT SELECT ON ${tableName} TO ${diagnosticResults.systemInfo.user || 'your_user'}`
              : `Create the "${tableName}" table or update the queries to use existing tables`
          });
        }
        
        diagnosticResults.tablesInfo[tableName] = {
          exists: !errorMsg.includes('does not exist'),
          error: errorMsg
        };
      }
    }

    // Step 5: Generate alternative tables that may contain similar data
    if (diagnosticResults.missingTables.length > 0 || diagnosticResults.permissionIssues.length > 0) {
      try {
        // Look for tables with similar names to our missing/permission-denied tables
        const problemTables = [
          ...diagnosticResults.missingTables,
          ...diagnosticResults.permissionIssues.map((issue: {table: string}) => issue.table)
        ];
        
        const patterns = problemTables.map(table => `%${table.replace(/_/g, '%')}%`);
        const placeholders = patterns.map((_, i) => `$${i + 1}`).join(',');
        
        const similarTablesQuery = await executeQuery(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public' AND (
            ${patterns.map((_, i) => `table_name ILIKE $${i + 1}`).join(' OR ')}
          )
          ORDER BY table_name
        `, patterns);
        
        diagnosticResults.alternativeTables = similarTablesQuery
          .map((t: any) => t.table_name)
          .filter((name: string) => !expectedTables.includes(name));
        
        if (diagnosticResults.alternativeTables.length > 0) {
          diagnosticResults.suggestedFixes.push({
            issue: 'Alternative tables found that may contain similar data',
            solution: `Consider updating queries to use: ${diagnosticResults.alternativeTables.join(', ')}`
          });
        }
      } catch (similarError) {
        console.error('Error finding similar tables:', similarError);
      }
    }

    // Step 6: Generate SQL schema recommendations if tables are missing
    if (diagnosticResults.missingTables.includes('occupants')) {
      diagnosticResults.suggestedFixes.push({
        issue: 'Missing "occupants" table',
        solution: `
-- Create occupants table:
CREATE TABLE IF NOT EXISTS occupants (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id),
  intern_id INTEGER REFERENCES intern_details(intern_id),
  check_in_date DATE,
  check_out_date DATE,
  UNIQUE(room_id, intern_id)
);`
      });
    }

    return NextResponse.json({
      success: true,
      ...diagnosticResults
    });

  } catch (error) {
    console.error('Database diagnostic error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
