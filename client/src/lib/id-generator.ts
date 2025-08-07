/**
 * Utility functions for generating random IDs
 */

/**
 * Generate a random 6-character alphanumeric ID
 * Uses uppercase letters and numbers for better readability
 */
export function generateBookingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate if a string is a valid booking ID format
 */
export function isValidBookingId(id: string): boolean {
  return /^[A-Z0-9]{6}$/.test(id);
}