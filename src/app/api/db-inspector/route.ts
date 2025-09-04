import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    console.log('=== DATABASE INSPECTION TOOL ===');
    
    // Database configuration based on environment variables
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false,
    };
    
    console.log('Attempting to connect with config:', { 
      host: dbConfig.host, 
      port: dbConfig.port, 
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: process.env.DB_SSL_MODE 
    });
    
    // Create a direct pool connection
    const pool = new Pool(dbConfig);
    
    // Test basic connection
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('Connection successful:', connectionTest.rows[0]);
    
    // Check database permissions
    const permissionsQuery = await pool.query(`
      SELECT 
        table_name,
        privilege_type
      FROM 
        information_schema.table_privileges
      WHERE 
        grantee = $1 AND table_schema = 'public'
      ORDER BY 
        table_name, privilege_type
    `, [dbConfig.user]);
    
    console.log('User permissions:', permissionsQuery.rows);
    
    // Check table existence
    const tablesQuery = await pool.query(`
      SELECT 
        table_name 
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name
    `);
    
    console.log('Available tables:', tablesQuery.rows.map(row => row.table_name));
    
    // Get table schemas for tables we're trying to use
    const targetTables = ['intern_details', 'internship_info', 'departments', 'rooms', 'occupants', 'apartments'];
    const tableSchemas: Record<string, any> = {};
    
    for (const tableName of targetTables) {
      try {
        const exists = tablesQuery.rows.some(row => row.table_name === tableName);
        if (!exists) {
          console.log(`Table "${tableName}" doesn't exist!`);
          tableSchemas[tableName] = { error: 'Table does not exist' };
          continue;
        }
        
        const schemaQuery = await pool.query(`
          SELECT 
            column_name, 
            data_type, 
            is_nullable 
          FROM 
            information_schema.columns 
          WHERE 
            table_schema = 'public' AND table_name = $1
          ORDER BY 
            ordinal_position
        `, [tableName]);
        
        tableSchemas[tableName] = {
          exists: true,
          columns: schemaQuery.rows,
          canSelect: permissionsQuery.rows.some(
            row => row.table_name === tableName && row.privilege_type === 'SELECT'
          )
        };
      } catch (error) {
        console.error(`Error checking table ${tableName}:`, error);
        tableSchemas[tableName] = { error: error instanceof Error ? error.message : String(error) };
      }
    }
    
    // Close the connection
    await pool.end();
    
    return NextResponse.json({
      success: true,
      dbConfig: {
        host: dbConfig.host, 
        port: dbConfig.port, 
        database: dbConfig.database,
        user: dbConfig.user,
        ssl: process.env.DB_SSL_MODE 
      },
      connectionTest: connectionTest.rows[0],
      permissions: permissionsQuery.rows,
      tables: tablesQuery.rows.map(row => row.table_name),
      tableSchemas,
      recommendations: []
    });
    
  } catch (error) {
    console.error('Database inspection error:', error);
    
    // Provide diagnostics on the error
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    const recommendations = [];
    
    if (errorInfo.code === '28000' || errorInfo.code === '28P01') {
      recommendations.push('Authentication failed. Check your DB_USER and DB_PASSWORD environment variables.');
    } else if (errorInfo.code === '3D000') {
      recommendations.push('Database does not exist. Check your DB_NAME environment variable.');
    } else if (errorInfo.code === 'ENOTFOUND' || errorInfo.code === 'ECONNREFUSED') {
      recommendations.push('Could not connect to database server. Check your DB_HOST and DB_PORT environment variables.');
    } else if (errorInfo.message.includes('permission denied')) {
      recommendations.push('Permission denied. The user does not have sufficient privileges.');
    } else if (errorInfo.message.includes('does not exist')) {
      recommendations.push('A table or column referenced in queries does not exist. You may need to create the required tables.');
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorInfo,
      recommendations,
      env: {
        DB_HOST: process.env.DB_HOST || 'not set',
        DB_PORT: process.env.DB_PORT || 'not set',
        DB_NAME: process.env.DB_NAME || 'not set',
        DB_USER: process.env.DB_USER || 'not set',
        DB_SSL_MODE: process.env.DB_SSL_MODE || 'not set',
      }
    }, { status: 500 });
  }
}
