/**
 * Generates a URL-friendly slug from a string
 * 
 * @param text The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generates a slug from the title if no slug is provided
 * 
 * @param title The post title
 * @param providedSlug Optional slug that takes precedence if provided
 * @returns The final slug to use
 */
export function getSlug(title: string, providedSlug?: string): string {
  if (providedSlug) {
    return providedSlug;
  }
  
  return slugify(title);
}
