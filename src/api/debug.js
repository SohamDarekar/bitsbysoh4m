/**
 * Debug utility functions for the API
 */

const DEBUG_MODE = process.env.DEBUG === 'true';

/**
 * Log debug messages when DEBUG_MODE is enabled
 * @param {string} message - The debug message
 * @param {any} data - Optional data to log
 */
export function debug(message, data = null) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`);
    if (data) {
      console.log(data);
    }
  }
}

/**
 * Log error messages
 * @param {string} message - The error message
 * @param {Error|any} error - The error object
 */
export function logError(message, error = null) {
  console.error(`[ERROR] ${message}`);
  if (error) {
    if (error instanceof Error) {
      console.error(`${error.name}: ${error.message}`);
      console.error(error.stack);
    } else {
      console.error(error);
    }
  }
}

/**
 * Create a timer for performance debugging
 * @returns {function} Function to call to get elapsed time
 */
export function createTimer() {
  const start = performance.now();
  return () => {
    const elapsed = performance.now() - start;
    return `${elapsed.toFixed(2)}ms`;
  };
}

/**
 * Log API endpoint calls for debugging
 * @param {string} endpoint - The endpoint being called
 * @param {Object} req - The request object
 */
export function logEndpointCall(endpoint, req) {
  if (DEBUG_MODE) {
    console.log(`[API] ${req.method} ${endpoint}`);
    console.log(`  ↪ Body: ${JSON.stringify(req.body || {})}`);
    console.log(`  ↪ Query: ${JSON.stringify(req.query || {})}`);
    console.log(`  ↪ Headers: ${JSON.stringify(req.headers || {})}`);
  }
}

/**
 * Log API errors with context
 * @param {string} endpoint - The endpoint where the error occurred
 * @param {Error|any} error - The error object
 */
export function logApiError(endpoint, error) {
  console.error(`[API ERROR] ${endpoint}`);
  logError(`Error in ${endpoint}`, error);
}

/**
 * Inspect SMTP configuration for debugging
 * @param {Object} config - SMTP configuration object
 * @returns {Object} Sanitized SMTP configuration
 */
export function inspectSmtpConfig(config) {
  if (!DEBUG_MODE) {
    return { message: "SMTP config inspection only available in debug mode" };
  }
  
  // Return sanitized version of config (no passwords)
  return {
    host: config.host || 'Not set',
    port: config.port || 'Not set',
    secure: config.secure || false,
    auth: {
      user: config.auth?.user || 'Not set',
      pass: config.auth?.pass ? '********' : 'Not set'
    },
    tls: config.tls || {}
  };
}

// Default export for convenience
export default {
  debug,
  logError,
  createTimer,
  logEndpointCall,
  logApiError,
  inspectSmtpConfig
};
