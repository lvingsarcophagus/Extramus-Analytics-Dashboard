import 'server-only';
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
  max: 3, // Reduced pool size to prevent connection exhaustion
  min: 0, // No minimum connections to allow full shutdown
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 15000, // Connection timeout 15 seconds
  statement_timeout: 30000, // Query timeout 30 seconds
  query_timeout: 30000, // Query timeout 30 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 15000,
  allowExitOnIdle: true, // Allow pool to close when idle
};

// Create a global connection pool - only on server side
let pool: Pool | null = null;

export async function getPool(): Promise<Pool> {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations are not available on the client side');
  }

  if (!pool) {
    // Use dynamic import to avoid build-time issues
    const { Pool } = await import('pg');
    pool = new Pool(dbConfig);

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err);
      // Reset pool on error
      pool = null;
    });
  }

  if (!pool) {
    throw new Error('Failed to create database pool');
  }

  return pool;
}

// Test database connection with better error handling
export async function testConnection(): Promise<boolean> {
  let client: PoolClient | null = null;
  try {
    const pool = await getPool();
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connected successfully:', result.rows[0]);
    }
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Database connection failed:', errorMessage);
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }
    // Log environment variables for debugging (do not log password)
    console.error('DB_HOST:', process.env.DB_HOST);
    console.error('DB_PORT:', process.env.DB_PORT);
    console.error('DB_NAME:', process.env.DB_NAME);
    console.error('DB_USER:', process.env.DB_USER);
    console.error('DB_SSL_MODE:', process.env.DB_SSL_MODE);
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
  if (typeof window !== 'undefined') {
    throw new Error('Database operations are not available on the client side');
  }

  let client: PoolClient | null = null;
  let retries = 3; // Increased retries

  while (retries > 0) {
    try {
      const pool = await getPool();
      client = await pool.connect();
      const result = await client.query(text, params);
      return result.rows;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      const errorCode = error instanceof Error && 'code' in error ? (error as Error & { code: string }).code : undefined;

      console.error(`Query execution failed (${retries} retries left):`, errorMessage);
      if (errorStack) {
        console.error('Error stack:', errorStack);
      }
      // Log environment variables for debugging (do not log password)
      console.error('DB_HOST:', process.env.DB_HOST);
      console.error('DB_PORT:', process.env.DB_PORT);
      console.error('DB_NAME:', process.env.DB_NAME);
      console.error('DB_USER:', process.env.DB_USER);
      console.error('DB_SSL_MODE:', process.env.DB_SSL_MODE);

      // Reset pool on connection errors
      if (errorCode === 'ECONNRESET' || errorCode === 'ENOTFOUND' ||
          errorMessage.includes('timeout') || errorMessage.includes('terminated') ||
          errorMessage.includes('pool after calling end')) {
        if (pool) {
          await pool.end().catch(() => {});
          pool = null;
        }
      }

      retries--;
      if (retries === 0) {
        throw new Error(`Database query failed: ${errorMessage}`);
      }

      // Exponential backoff: wait longer between retries
      const waitTime = (3 - retries) * 2000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          console.warn('Error releasing client:', releaseError);
        }
        client = null;
      }
    }
  }

  throw new Error('Query execution failed after all retries');
}

// Global flag to track database availability
let isDatabaseAvailable = true;

// Check database availability
export async function checkDatabaseAvailability(): Promise<boolean> {
  try {
    await testConnection();
    isDatabaseAvailable = true;
    return true;
  } catch {
    isDatabaseAvailable = false;
    return false;
  }
}

// Get database availability status
export function getDatabaseStatus(): boolean {
  return isDatabaseAvailable;
}

// Safe query execution with fallback
export async function safeExecuteQuery(
  text: string,
  params?: (string | number | boolean | Date)[],
  fallbackData?: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  try {
    const result = await executeQuery(text, params);
    isDatabaseAvailable = true;
    return result;
  } catch (error) {
    console.warn('Database query failed, using fallback data:', error);
    isDatabaseAvailable = false;

    if (fallbackData) {
      return fallbackData;
    }

    // Return empty array as last resort
    return [];
  }
}
