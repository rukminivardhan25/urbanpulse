/**
 * Time utility functions for converting between 12hr (AM/PM) and 24hr formats
 */

/**
 * Convert 24hr time (e.g., "07:00") to 12hr format (e.g., "7:00 AM")
 * @param {string} time24hr - Time in 24hr format (e.g., "07:00" or "21:00")
 * @returns {string} Time in 12hr format (e.g., "7:00 AM" or "9:00 PM")
 */
export const convert24hrTo12hr = (time24hr) => {
  if (!time24hr) return '';

  // Remove extra spaces
  const cleaned = time24hr.trim();
  
  // Match 24hr format (HH:MM)
  const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  
  if (!match) {
    // If already in 12hr format, return as is
    if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(cleaned)) {
      return cleaned;
    }
    return cleaned; // Return as is if format is unknown
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${hours}:${minutes} ${period}`;
};

/**
 * Format time range in 12hr format (e.g., "7:00 AM – 9:00 AM")
 * @param {string} startTime24hr - Start time in 24hr format
 * @param {string} endTime24hr - End time in 24hr format
 * @returns {string} Formatted time range
 */
export const formatTimeRange12hr = (startTime24hr, endTime24hr) => {
  if (!startTime24hr && !endTime24hr) return '';
  if (!startTime24hr) return convert24hrTo12hr(endTime24hr);
  if (!endTime24hr) return convert24hrTo12hr(startTime24hr);
  
  return `${convert24hrTo12hr(startTime24hr)} – ${convert24hrTo12hr(endTime24hr)}`;
};




