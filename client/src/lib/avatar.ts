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


export function getInitials(name: string): string {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);

  // If there's only one word, take its first 2 characters (e.g., "Admin" -> "AD")
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  // Otherwise, take the first letter of the first word and the first letter of the last word
  const firstInitial = parts[0][0] || "";
  const lastInitial = parts[parts.length - 1][0] || "";

  return (firstInitial + lastInitial).toUpperCase();
}