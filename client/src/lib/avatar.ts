// src/lib/avatar.ts

/**
 * Hashes a string into a consistent HSL color profile
 * Optimized for accessible text contrast in dark/light backgrounds
 */
export function getPersistentColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Map hash value to a Hue between 0 and 360
  const hue = Math.abs(hash % 360);
  // Keep saturation and lightness stable for clean dark-mode UI integration
  return `hsl(${hue}, 65%, 45%)`;
}

/**
 * Extracts a clean 1-2 character display token
 */
export function getInitials(name: string): string {
  if (!name) return "";
  return name.trim().slice(0, 2).toUpperCase();
}
