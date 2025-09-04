import 'server-only';

export interface DatabaseError {
  message: string;
  code?: string;
  detail?: string;
  hint?: string;
  name?: string;
  source: 'database' | 'connection' | 'query';
  table?: string;
  column?: string;
  severity?: 'ERROR' | 'FATAL' | 'PANIC' | 'WARNING' | 'NOTICE' | 'DEBUG' | 'INFO' | 'LOG';
  human_readable?: string;
  suggested_fix?: string;
}

/**
 * Enhanced error handler for database errors that provides more helpful
 * information and suggested fixes
 */
export function processDbError(error: unknown): DatabaseError {
  // Default error object
  const dbError: DatabaseError = {
    message: 'Unknown database error',
    source: 'database'
  };
  
  // Basic error handling
  if (error instanceof Error) {
    dbError.message = error.message;
    dbError.name = error.name;
    
    // Handle PostgreSQL specific error properties
    if ('code' in error) {
      const pgError = error as Error & { 
        code: string; 
        detail?: string; 
        hint?: string;
        severity?: string; 
        table?: string;
        column?: string;
      };
      
      dbError.code = pgError.code;
      dbError.detail = pgError.detail;
      dbError.hint = pgError.hint;
      dbError.table = pgError.table;
      dbError.column = pgError.column;
      dbError.severity = pgError.severity as DatabaseError['severity'];
      
      // Process specific error codes
      switch (pgError.code) {
        // Connection errors
        case 'ECONNREFUSED':
        case 'ETIMEDOUT':
        case 'ENOTFOUND':
          dbError.source = 'connection';
          dbError.human_readable = 'Unable to connect to database server';
          dbError.suggested_fix = 'Check that database server is running and network connectivity is available';
          break;
          
        // Authentication errors  
        case '28000': // Invalid authorization specification
        case '28P01': // Invalid password
          dbError.source = 'connection';
          dbError.human_readable = 'Authentication failed - incorrect username or password';
          dbError.suggested_fix = 'Check DB_USER and DB_PASSWORD environment variables';
          break;
          
        // Permission errors  
        case '42501': // Insufficient privilege
          dbError.source = 'query';
          dbError.human_readable = `Permission denied for ${dbError.table ? `table ${dbError.table}` : 'database object'}`;
          dbError.suggested_fix = dbError.table 
            ? `Grant appropriate permissions with: GRANT SELECT ON ${dbError.table} TO your_user;`
            : 'Grant appropriate permissions to the database user';
          break;
          
        // Table/relation not found
        case '42P01': // Undefined table
          dbError.source = 'query';
          const tableName = extractTableName(pgError.message);
          dbError.table = tableName || dbError.table;
          dbError.human_readable = `Table ${tableName || 'specified'} does not exist`;
          dbError.suggested_fix = `Create the missing table or update queries to use existing schema`;
          break;
          
        // Column errors  
        case '42703': // Undefined column
          dbError.source = 'query';
          dbError.human_readable = `Column ${dbError.column || 'specified'} does not exist`;
          dbError.suggested_fix = `Check column name or update table schema`;
          break;
          
        // Database does not exist  
        case '3D000':
          dbError.source = 'connection';
          dbError.human_readable = 'Database does not exist';
          dbError.suggested_fix = 'Check DB_NAME environment variable and create database if needed';
          break;
          
        default:
          // For other errors, extract useful information from message
          if (pgError.message.includes('permission denied')) {
            dbError.source = 'query';
            dbError.human_readable = 'Permission denied for database operation';
            dbError.suggested_fix = 'Grant appropriate permissions to the database user';
          } else if (pgError.message.includes('does not exist')) {
            dbError.source = 'query';
            dbError.human_readable = 'Database object does not exist';
            dbError.suggested_fix = 'Check that tables and columns referenced in queries exist';
          } else if (pgError.message.includes('timeout')) {
            dbError.source = 'connection';
            dbError.human_readable = 'Database operation timed out';
            dbError.suggested_fix = 'Check database server performance and network connectivity';
          }
      }
    }
  } else if (typeof error === 'string') {
    dbError.message = error;
  }
  
  // If we still don't have human readable message or suggestion
  if (!dbError.human_readable) {
    dbError.human_readable = dbError.message;
  }
  
  return dbError;
}

/**
 * Try to extract table name from error message
 */
function extractTableName(message: string): string | null {
  // Common error patterns for table not found
  const relationPattern = /relation "([^"]+)" does not exist/;
  const tablePattern = /table "([^"]+)" does not exist/;
  const relationMatch = message.match(relationPattern);
  const tableMatch = message.match(tablePattern);
  
  if (relationMatch && relationMatch[1]) {
    return relationMatch[1];
  }
  
  if (tableMatch && tableMatch[1]) {
    return tableMatch[1];
  }
  
  return null;
}
