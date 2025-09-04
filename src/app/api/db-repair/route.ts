import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';
import { Pool } from 'pg';

// Enhanced database utility to create missing tables when needed
export async function GET() {
  try {
    console.log('=== DB REPAIR TOOL ===');
    
    // Step 1: Check database connection
    const connectionTest = await safeExecuteQuery('SELECT 1 as connection_test', []);
    const isConnected = connectionTest && connectionTest.length > 0 && 
                        connectionTest[0].connection_test === 1;
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        recommendations: [
          'Check your database connection settings in env.local file',
          'Ensure the database server is running',
          'Verify the database user has proper connection privileges'
        ]
      });
    }
    
    // Step 2: Check existing tables
    const requiredTables = [
      'intern_details', 
      'internship_info', 
      'departments', 
      'apartments', 
      'rooms', 
      'occupants'
    ];
    
    const tableStatus: Record<string, boolean> = {};
    const tablesToCreate: string[] = [];
    
    for (const table of requiredTables) {
      const exists = await safeExecuteQuery(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [table]
      );
      
      const tableExists = exists && exists.length > 0 && exists[0].exists === true;
      tableStatus[table] = tableExists;
      
      if (!tableExists) {
        tablesToCreate.push(table);
      }
    }
    
    // Step 3: Get database user and permissions
    const userInfo = await safeExecuteQuery(
      `SELECT current_user, current_database()`,
      []
    );
    
    const currentUser = userInfo && userInfo.length > 0 ? userInfo[0].current_user : 'unknown';
    const currentDb = userInfo && userInfo.length > 0 ? userInfo[0].current_database : 'unknown';
    
    // Step 4: Create missing tables if needed
    const tablesCreated: Record<string, boolean> = {};
    const errors: string[] = [];
    
    // Only proceed if we have tables to create
    if (tablesToCreate.length > 0) {
      // Define table schemas - simplified versions for testing
      const tableSchemas: Record<string, string> = {
        intern_details: `
          CREATE TABLE IF NOT EXISTS intern_details (
            intern_id VARCHAR(20) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            nationality VARCHAR(50),
            gender VARCHAR(20),
            birthdate DATE,
            email VARCHAR(100),
            phone VARCHAR(20)
          )
        `,
        internship_info: `
          CREATE TABLE IF NOT EXISTS internship_info (
            id SERIAL PRIMARY KEY,
            intern_id VARCHAR(20) REFERENCES intern_details(intern_id),
            department_id INTEGER,
            start_date DATE,
            end_date DATE,
            supervisor VARCHAR(100),
            status VARCHAR(20)
          )
        `,
        departments: `
          CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            department_name VARCHAR(100) NOT NULL
          )
        `,
        apartments: `
          CREATE TABLE IF NOT EXISTS apartments (
            apartment_id SERIAL PRIMARY KEY,
            address VARCHAR(200) NOT NULL,
            max_capacity INTEGER NOT NULL
          )
        `,
        rooms: `
          CREATE TABLE IF NOT EXISTS rooms (
            room_id SERIAL PRIMARY KEY,
            apartment_id INTEGER REFERENCES apartments(apartment_id),
            room_number VARCHAR(20) NOT NULL,
            capacity INTEGER NOT NULL
          )
        `,
        occupants: `
          CREATE TABLE IF NOT EXISTS occupants (
            occupant_id SERIAL PRIMARY KEY,
            room_id INTEGER REFERENCES rooms(room_id),
            intern_id VARCHAR(20) REFERENCES intern_details(intern_id),
            check_in_date DATE,
            check_out_date DATE
          )
        `
      };
      
      // Create missing tables
      for (const table of tablesToCreate) {
        try {
          if (tableSchemas[table]) {
            await safeExecuteQuery(tableSchemas[table], []);
            tablesCreated[table] = true;
          } else {
            errors.push(`Schema definition not found for table: ${table}`);
            tablesCreated[table] = false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Failed to create table ${table}: ${errorMessage}`);
          tablesCreated[table] = false;
        }
      }
    }
    
    // Step 5: Insert sample data if tables were just created
    const sampleDataInserted: Record<string, boolean> = {};
    
    // Only insert sample data for tables that were just created
    for (const table of Object.keys(tablesCreated)) {
      if (tablesCreated[table]) {
        try {
          // Insert minimal sample data for testing
          switch (table) {
            case 'departments':
              await safeExecuteQuery(`
                INSERT INTO departments (department_name)
                VALUES ('Engineering'), ('Data Science'), ('Marketing'), ('Finance'), ('Research')
                ON CONFLICT DO NOTHING
              `, []);
              sampleDataInserted[table] = true;
              break;
              
            case 'intern_details':
              await safeExecuteQuery(`
                INSERT INTO intern_details (intern_id, name, nationality, gender, email)
                VALUES 
                  ('INT001', 'Emma Rodriguez', 'USA', 'female', 'emma.r@example.com'),
                  ('INT002', 'Raj Patel', 'India', 'male', 'raj.p@example.com'),
                  ('INT003', 'Sophie Miller', 'Germany', 'female', 'sophie.m@example.com')
                ON CONFLICT DO NOTHING
              `, []);
              sampleDataInserted[table] = true;
              break;
              
            case 'internship_info':
              // Only insert if we have departments and intern_details
              if (tableStatus['departments'] && tableStatus['intern_details']) {
                await safeExecuteQuery(`
                  INSERT INTO internship_info (intern_id, department_id, start_date, end_date, status)
                  VALUES 
                    ('INT001', 1, '2023-06-01', '2023-08-31', 'completed'),
                    ('INT002', 2, '2023-06-01', '2023-08-31', 'completed'),
                    ('INT003', 3, '2024-06-01', '2024-08-31', 'active')
                  ON CONFLICT DO NOTHING
                `, []);
                sampleDataInserted[table] = true;
              }
              break;
              
            case 'apartments':
              await safeExecuteQuery(`
                INSERT INTO apartments (address, max_capacity)
                VALUES 
                  ('123 University Ave', 4),
                  ('456 College St', 6)
                ON CONFLICT DO NOTHING
              `, []);
              sampleDataInserted[table] = true;
              break;
              
            case 'rooms':
              // Only insert if we have apartments
              if (tableStatus['apartments']) {
                await safeExecuteQuery(`
                  INSERT INTO rooms (apartment_id, room_number, capacity)
                  VALUES 
                    (1, 'A101', 2),
                    (1, 'A102', 2),
                    (2, 'B201', 2),
                    (2, 'B202', 2),
                    (2, 'B203', 2)
                  ON CONFLICT DO NOTHING
                `, []);
                sampleDataInserted[table] = true;
              }
              break;
              
            case 'occupants':
              // Only insert if we have rooms and intern_details
              if (tableStatus['rooms'] && tableStatus['intern_details']) {
                await safeExecuteQuery(`
                  INSERT INTO occupants (room_id, intern_id, check_in_date, check_out_date)
                  VALUES 
                    (1, 'INT001', '2023-06-01', '2023-08-31'),
                    (3, 'INT002', '2023-06-01', '2023-08-31'),
                    (4, 'INT003', '2024-06-01', NULL)
                  ON CONFLICT DO NOTHING
                `, []);
                sampleDataInserted[table] = true;
              }
              break;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Failed to insert sample data for ${table}: ${errorMessage}`);
          sampleDataInserted[table] = false;
        }
      }
    }
    
    // Step 6: Grant permissions if needed
    let permissionsGranted = false;
    try {
      // Grant permissions to current user if we created tables
      if (tablesToCreate.length > 0) {
        await safeExecuteQuery(
          `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${currentUser}`,
          []
        );
        permissionsGranted = true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to grant permissions: ${errorMessage}`);
    }
    
    // Return complete status
    return NextResponse.json({
      success: true,
      connection: {
        status: isConnected,
        user: currentUser,
        database: currentDb
      },
      tables: {
        existing: tableStatus,
        created: tablesCreated
      },
      sampleData: sampleDataInserted,
      permissions: {
        granted: permissionsGranted
      },
      errors: errors.length > 0 ? errors : null,
      recommendations: errors.length > 0 ? [
        'Check if your database user has CREATE TABLE permissions',
        'You may need to run this repair tool with admin database privileges',
        'If tables were created but data insertion failed, try running the API endpoints now'
      ] : [
        'Database schema has been repaired and sample data inserted',
        'Try accessing the dashboard and API endpoints now'
      ]
    });
    
  } catch (error) {
    console.error('DB Repair Tool error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      recommendations: [
        'Check your database connection settings',
        'Ensure the database server is running',
        'Verify the database user has proper connection privileges',
        'You may need to create the database tables manually'
      ]
    });
  }
}
