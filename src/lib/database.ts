import { Pool, PoolConfig, PoolClient } from 'pg';

// Function to safely decode password with special characters
function getDecodedPassword(): string {
  const password = process.env.DB_PASSWORD || '';
  // Handle URL encoded characters in password
  try {
    return decodeURIComponent(password);
  } catch {
    return password;
  }
}

// Database configuration with improved timeout handling
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: getDecodedPassword(),
  ssl: process.env.DB_SSL_MODE === 'disable' ? false : { rejectUnauthorized: false },
  max: 5, // Further reduced pool size
  min: 1, // Minimum connections to maintain
  idleTimeoutMillis: 15000, // Close idle clients after 15 seconds
  connectionTimeoutMillis: 8000, // Connection timeout 8 seconds
  statement_timeout: 15000, // Query timeout 15 seconds
  query_timeout: 15000, // Query timeout 15 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Create a global connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err);
      // Reset pool on error
      pool = null;
    });

    // Remove verbose connection logging for performance
    // pool.on('connect', () => {
    //   console.log('New database connection established');
    // });

    // pool.on('remove', () => {
    //   console.log('Database connection removed from pool');
    // });
  }
  
  return pool;
}

// Test database connection with better error handling
export async function testConnection(): Promise<boolean> {
  let client: PoolClient | null = null;
  try {
    const pool = getPool();
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    // Only log in development mode for performance
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connected successfully:', result.rows[0]);
    }
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    // Reset pool on connection failure
    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Helper function to execute queries safely with retry logic
export async function executeQuery(
  text: string,
  params?: (string | number | boolean | Date)[]
): Promise<Record<string, unknown>[]> {
  let client: PoolClient | null = null;
  let retries = 2;
  
  while (retries > 0) {
    try {
      const pool = getPool();
      client = await pool.connect();
      const result = await client.query(text, params);
      return result.rows;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = error instanceof Error && 'code' in error ? (error as Error & { code: string }).code : undefined;
      
      console.error(`Query execution failed (${retries} retries left):`, error);
      
      // Reset pool on connection errors
      if (errorCode === 'ECONNRESET' || errorCode === 'ENOTFOUND' || errorMessage.includes('timeout')) {
        if (pool) {
          await pool.end().catch(() => {});
          pool = null;
        }
      }
      
      retries--;
      if (retries === 0) {
        throw new Error(`Database query failed: ${errorMessage}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      if (client) {
        client.release();
        client = null;
      }
    }
  }
  
  throw new Error('Query execution failed after all retries');
}
