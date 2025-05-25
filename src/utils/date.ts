/**
 * Format a date string or Date object to a human-readable date format
 * 
 * @param date The date to format (string or Date object)
 * @returns Formatted date string (e.g., "May 25, 2025")
 */
export function formatDate(date: string | Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date string or Date object to a time string
 * 
 * @param date The date to format (string or Date object)
 * @returns Formatted time string (e.g., "5:44 PM")
 */
export function formatTime(date: string | Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
