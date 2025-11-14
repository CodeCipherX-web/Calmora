/**
 * Calmora - Database Connection Module
 * Handles MariaDB connection pool setup and configuration
 */

const mariadb = require('mariadb');
require('dotenv').config();

// Create MariaDB connection pool
// Connection pooling allows efficient reuse of database connections
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'calmora',
  connectionLimit: 10, // Maximum number of connections in the pool
  acquireTimeout: 30000, // Timeout in ms to get a connection
  timeout: 30000, // Query timeout in ms
  reconnect: true // Automatically reconnect if connection is lost
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✓ Database connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    return false;
  } finally {
    if (conn) conn.release(); // Release connection back to pool
  }
}

/**
 * Get a connection from the pool
 * Remember to release it when done using conn.release()
 * @returns {Promise<Connection>} Database connection
 */
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting database connection:', error.message);
    throw error;
  }
}

/**
 * Execute a query using the connection pool
 * This is a convenience function that handles connection acquisition and release
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise} Query results
 */
async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// Export pool and utility functions
module.exports = {
  pool,
  getConnection,
  query,
  testConnection
};
