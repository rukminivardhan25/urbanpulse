/**
 * Date Service for IST (Indian Standard Time) operations
 * IST is UTC+5:30
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Get current IST date (YYYY-MM-DD format)
 * @returns {Date} IST date at midnight
 */
const getISTDate = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + IST_OFFSET_MS);
  // Set to midnight IST
  istTime.setUTCHours(0, 0, 0, 0);
  return istTime;
};

/**
 * Get today's IST date (Date object at midnight IST)
 * @returns {Date}
 */
exports.getTodayIST = () => {
  return getISTDate();
};

/**
 * Get tomorrow's IST date (Date object at midnight IST)
 * @returns {Date}
 */
exports.getTomorrowIST = () => {
  const tomorrow = getISTDate();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow;
};

/**
 * Get this weekend (Saturday and Sunday) IST dates
 * @returns {Array<Date>} [saturdayDate, sundayDate]
 */
exports.getThisWeekendIST = () => {
  const today = getISTDate();
  const dayOfWeek = today.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Calculate Saturday
  let saturday = new Date(today);
  if (dayOfWeek === 0) {
    // If today is Sunday, go to next Saturday
    saturday.setUTCDate(saturday.getUTCDate() + 6);
  } else if (dayOfWeek < 6) {
    // If before Saturday, go to this Saturday
    saturday.setUTCDate(saturday.getUTCDate() + (6 - dayOfWeek));
  }
  // If today is Saturday, use today

  // Calculate Sunday (day after Saturday)
  let sunday = new Date(saturday);
  sunday.setUTCDate(sunday.getUTCDate() + 1);

  saturday.setUTCHours(0, 0, 0, 0);
  sunday.setUTCHours(0, 0, 0, 0);

  return [saturday, sunday];
};

/**
 * Check if a date is today (IST)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
exports.isTodayIST = (date) => {
  const today = getISTDate();
  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
};

/**
 * Check if a date is tomorrow (IST)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
exports.isTomorrowIST = (date) => {
  const tomorrow = exports.getTomorrowIST();
  return (
    date.getUTCFullYear() === tomorrow.getUTCFullYear() &&
    date.getUTCMonth() === tomorrow.getUTCMonth() &&
    date.getUTCDate() === tomorrow.getUTCDate()
  );
};

/**
 * Check if a date is this weekend (IST)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
exports.isThisWeekendIST = (date) => {
  const [saturday, sunday] = exports.getThisWeekendIST();
  return (
    (date.getUTCFullYear() === saturday.getUTCFullYear() &&
      date.getUTCMonth() === saturday.getUTCMonth() &&
      date.getUTCDate() === saturday.getUTCDate()) ||
    (date.getUTCFullYear() === sunday.getUTCFullYear() &&
      date.getUTCMonth() === sunday.getUTCMonth() &&
      date.getUTCDate() === sunday.getUTCDate())
  );
};

/**
 * Parse IST date string to Date object (midnight IST)
 * @param {string} dateString - Date string in YYYY-MM-DD format (IST)
 * @returns {Date}
 */
exports.parseISTDate = (dateString) => {
  // Parse as IST date (YYYY-MM-DD)
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  // Subtract IST offset to get correct UTC
  return new Date(date.getTime() - IST_OFFSET_MS);
};

/**
 * Format Date to IST date string (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} YYYY-MM-DD format
 */
exports.formatISTDate = (date) => {
  const istTime = new Date(date.getTime() + IST_OFFSET_MS);
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate service date based on schedule type
 * @param {string} scheduleType - daily, today, tomorrow, this_weekend, custom_date
 * @param {Date|null} customDate - Custom date (required for custom_date)
 * @returns {Date}
 */
exports.calculateServiceDate = (scheduleType, customDate = null) => {
  switch (scheduleType) {
    case 'daily':
      // For daily, use today as the base date (will always match)
      return exports.getTodayIST();
    case 'today':
      return exports.getTodayIST();
    case 'tomorrow':
      return exports.getTomorrowIST();
    case 'this_weekend':
      // Use Saturday of this weekend
      return exports.getThisWeekendIST()[0];
    case 'custom_date':
      if (!customDate) {
        throw new Error('Custom date is required for custom_date schedule type');
      }
      // Ensure it's at midnight IST
      const date = new Date(customDate);
      const istTime = new Date(date.getTime() + IST_OFFSET_MS);
      istTime.setUTCHours(0, 0, 0, 0);
      return new Date(istTime.getTime() - IST_OFFSET_MS);
    default:
      throw new Error(`Invalid schedule type: ${scheduleType}`);
  }
};




