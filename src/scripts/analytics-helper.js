/**
 * Google Analytics Helper Functions
 * This file provides safe methods to use Google Analytics without cookie warnings
 */

// The measurement ID for your Google Analytics property
const MEASUREMENT_ID = 'G-P300W8XW2P';

/**
 * Gets the appropriate cookie domain for the current hostname
 * @returns {string} The cookie domain to use
 */
function getCookieDomain() {
  const hostname = window.location.hostname;

  // For localhost, use an empty string
  if (hostname === 'localhost') {
    return '';
  }

  // For netlify.app subdomains, use .netlify.app
  if (hostname.endsWith('.netlify.app')) {
    return '.netlify.app';
  }

  // For github.io, use the base domain
  const domainParts = hostname.split('.');
  if (domainParts.length > 2 && hostname.includes('github.io')) {
    return `.${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;
  }

  // For custom domains, use the hostname
  return hostname;
}

/**
 * Safely sends an event to Google Analytics without overwriting cookie expiry
 * Only use 'event' calls here, never 'config' to avoid cookie warnings.
 * @param {string} eventName - Name of the event
 * @param {Object} params - Event parameters
 * @returns {boolean} Success status
 */
export function sendGAEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }

  // Prevent accidental config call
  if (eventName === 'config') {
    console.warn('Do NOT call gtag("config", ...) after initial load. This will cause cookie warnings.');
    return false;
  }
  
  try {
    // Use send_to parameter to avoid reconfiguring the tracker
    const eventParams = {
      ...params,
      send_to: MEASUREMENT_ID
    };
    
    // Only send as event, never config!
    window.gtag('event', eventName, eventParams);
    return true;
  } catch (error) {
    console.error('Error sending GA event:', error);
    return false;
  }
}

/**
 * Tracks a page view event
 * @param {string} path - The page path
 * @param {string} title - The page title
 * @returns {boolean} Success status
 */
export function trackPageView(path = window.location.pathname, title = document.title) {
  return sendGAEvent('page_view', {
    page_location: window.location.origin + path,
    page_path: path,
    page_title: title
  });
}

/**
 * Checks if Google Analytics is properly initialized
 * @returns {boolean} Whether GA is ready
 */
export function isGAInitialized() {
  return typeof window !== 'undefined' && 
         typeof window.gtag === 'function' && 
         window.gaInitialized === true;
}

/**
 * Wait for Google Analytics to initialize
 * @param {Function} callback - Function to call when GA is ready
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @param {number} interval - Check interval in milliseconds
 */
export function whenGAReady(callback, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  
  const checkGA = () => {
    if (isGAInitialized()) {
      callback();
      return;
    }
    
    if (Date.now() - startTime > timeout) {
      console.warn('Timeout waiting for Google Analytics');
      return;
    }
    
    setTimeout(checkGA, interval);
  };
  
  checkGA();
}

/**
 * Debugging function to check cookie status
 * @returns {Object} Cookie information
 */
export function debugGACookies() {
  const allCookies = document.cookie.split(';');
  const gaCookies = allCookies.filter(cookie => 
    cookie.trim().startsWith('_ga') || 
    cookie.trim().startsWith('_gid')
  );
  
  return {
    hostname: window.location.hostname,
    calculatedCookieDomain: getCookieDomain(),
    cookiesFound: gaCookies.length,
    cookies: gaCookies.map(c => c.trim())
  };
}
