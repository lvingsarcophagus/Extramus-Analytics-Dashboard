import { NextResponse } from 'next/server';
import { safeExecuteQuery } from '@/lib/database';

export async function GET() {
  try {
    console.log('=== ENHANCED DATABASE LIBRARY ===');
    
    // This is a replacement for the library code, provided as an API
    // for debugging purposes
    
    // Define the enhanced executeQuery function
    const enhancedExecuteQuery = async (
      text: string,
      params?: (string | number | boolean | Date)[]
    ) => {
      // Add detailed logging for development
      console.log('Executing query:', text);
      console.log('With params:', params);
      
      try {
        // Use the existing safeExecuteQuery but with additional instrumentation
        const startTime = Date.now();
        const result = await safeExecuteQuery(text, params);
        const duration = Date.now() - startTime;
        
        console.log(`Query completed in ${duration}ms with ${result.length} results`);
        return {
          success: true,
          duration,
          rowCount: result.length,
          results: result
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined;
        
        console.error('Query execution failed:', errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorCode,
          query: text,
          params
        };
      }
    };
    
    // Test basic database functionality
    const basicTests = {
      connection: await enhancedExecuteQuery('SELECT 1 as connection_test', []),
      tables: await enhancedExecuteQuery(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `, []),
      currentUser: await enhancedExecuteQuery('SELECT current_user, current_database()', [])
    };
    
    // Test specific table access
    const tableTests = {
      internDetails: await enhancedExecuteQuery('SELECT COUNT(*) FROM intern_details', []),
      departments: await enhancedExecuteQuery('SELECT COUNT(*) FROM departments', []),
      housing: await enhancedExecuteQuery('SELECT COUNT(*) FROM apartments', []),
      rooms: await enhancedExecuteQuery('SELECT COUNT(*) FROM rooms', []),
      occupants: await enhancedExecuteQuery('SELECT COUNT(*) FROM occupants', [])
    };
    
    // Create usage examples to help the user
    const usageExamples = {
      simpleQuery: `
// Example of simple query
const interns = await safeExecuteQuery('SELECT * FROM intern_details', []);
`,
      parameterizedQuery: `
// Example of parameterized query
const department = 'Engineering';
const internsInDepartment = await safeExecuteQuery(
  \`SELECT id.* 
   FROM intern_details id
   JOIN internship_info ii ON id.intern_id = ii.intern_id
   JOIN departments d ON ii.department_id = d.id
   WHERE d.department_name = $1\`,
  [department]
);
`,
      errorHandling: `
// Example with error handling
try {
  const result = await safeExecuteQuery('SELECT * FROM intern_details', []);
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error('Database error:', error);
  return NextResponse.json({ 
    success: false, 
    error: 'Database error occurred',
    // Provide fallback data to prevent UI errors
    data: [] 
  });
}
`
    };
    
    return NextResponse.json({
      success: true,
      message: 'Enhanced database library tests',
      basicTests,
      tableTests,
      usageExamples,
      recommendations: [
        'Use the /api/db-repair endpoint to repair any missing tables',
        'Use the -adapted API endpoints which provide fallback data',
        'Update your frontend components to use these adapted endpoints'
      ]
    });
    
  } catch (error) {
    console.error('Enhanced Database Library error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      recommendations: [
        'Check your database connection settings',
        'Use the /api/db-repair endpoint to repair any database issues'
      ]
    });
  }
}
