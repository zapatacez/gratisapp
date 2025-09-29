/**
 * Safely formats a date string or number into a locale-specific string.
 * Handles invalid or missing inputs gracefully.
 */
export function formatDate(dateInput: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateInput) {
    return 'Date TBD';
  }
  const date = new Date(dateInput);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  };

  return date.toLocaleString('en-US', { ...defaultOptions, ...options });
}

/**
 * Generates a URL-friendly slug from a string.
 */
export function slugify(text: string | undefined): string {
  if (!text) return 'event';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}