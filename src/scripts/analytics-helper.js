/**
 * Google Analytics Helper Functions
 * This file provides safe methods to use Google Analytics without cookie warnings
 */

// The measurement ID for your Google Analytics property
const MEASUREMENT_ID = 'G-P300W8XW2P';

/**
 * Safely sends an event to Google Analytics without overwriting cookie expiry
 * @param {string} eventName - Name of the event
 * @param {Object} params - Event parameters
 * @returns {boolean} Success status
 */
export function sendGAEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }
  
  try {
    // Use send_to parameter to avoid reconfiguring the tracker
    const eventParams = {
      ...params,
      send_to: MEASUREMENT_ID
    };
    
    // Send as event only
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
