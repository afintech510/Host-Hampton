/**
 * Date and time formatting utilities for Host Hampton
 * All dates are stored in UTC but displayed in America/New_York (EST/EDT)
 */

/**
 * Convert a UTC date to America/New_York timezone and format it
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "Wednesday, October 31, 2024")
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York"
  }).format(dateObj);
};

/**
 * Convert a UTC date to America/New_York timezone and format the time
 * @param date - Date object or ISO string
 * @returns Formatted time string (e.g., "3:30 PM")
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York"
  }).format(dateObj);
};

/**
 * Format date in short format (e.g., "Oct 31, 2024")
 * @param date - Date object or ISO string
 * @returns Short formatted date string
 */
export const formatDateShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(dateObj);
};

/**
 * Format date and time together
 * @param date - Date object or ISO string
 * @returns Formatted date and time string (e.g., "October 31, 2024 at 3:30 PM")
 */
export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Get just the date portion in YYYY-MM-DD format for America/New_York timezone
 * @param date - Date object or ISO string
 * @returns Date string in YYYY-MM-DD format
 */
export const getLocalDateString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/New_York"
  }).format(dateObj).split('/').reverse().join('-').replace(/(\d+)-(\d+)-(\d+)/, '$3-$1-$2');
};
