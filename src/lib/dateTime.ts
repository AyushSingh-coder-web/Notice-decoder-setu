/**
 * Pure date and time utility functions for Notice Decoder
 */

const MONTH_NAMES: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

/**
 * Converts a time string (e.g., "10:00 AM", "2:30 PM", "14:00", "12 PM") to 24hr "HH:mm".
 */
export function normalizeTime(rawTime: string): string | null {
  if (!rawTime) return null;
  const str = rawTime.trim().toLowerCase();

  // Pattern: 12:00 noon / 12 noon / noon
  if (str === 'noon' || str === '12 noon' || str === '12:00 noon') {
    return '12:00';
  }
  if (str === 'midnight' || str === '12 midnight' || str === '12:00 midnight') {
    return '00:00';
  }

  // Pattern: 10:30 am / 2:15 pm / 12:00 noon
  const match12h = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm|noon)$/);
  if (match12h) {
    let hours = parseInt(match12h[1], 10);
    const minutes = parseInt(match12h[2], 10);
    const meridian = match12h[3];

    if (meridian === 'noon') return '12:00';
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Pattern: 2 pm / 10 am / 12 pm / 12 noon
  const matchMeridianOnly = str.match(/^(\d{1,2})\s*(am|pm|noon)$/);
  if (matchMeridianOnly) {
    let hours = parseInt(matchMeridianOnly[1], 10);
    const meridian = matchMeridianOnly[2];

    if (meridian === 'noon') return '12:00';
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:00`;
  }

  // Pattern: 14:00 / 09:30 (24h)
  const match24h = str.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match24h) {
    const hours = parseInt(match24h[1], 10);
    const minutes = parseInt(match24h[2], 10);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return null;
}

/**
 * Converts "HH:mm" to minutes since midnight for deterministic time arithmetic.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes since midnight back to "HH:mm" 24hr string.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Normalizes varied human dates to ISO "YYYY-MM-DD".
 * Supports:
 * - "13 November 2026", "13 Nov 2026"
 * - "November 13, 2026"
 * - "13/11/2026", "13-11-2026"
 * - "2026-11-13"
 * Returns { date: string, yearInferred: boolean } or null.
 */
export function normalizeDate(
  rawDate: string,
  defaultYear: number = 2026
): { date: string; yearInferred: boolean } | null {
  if (!rawDate) return null;
  const cleaned = rawDate.trim().replace(/,/g, '');

  // 1. ISO YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return { date: cleaned, yearInferred: false };
  }

  // 2. DD/MM/YYYY or DD-MM-YYYY
  const slashDashMatch = cleaned.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (slashDashMatch) {
    const day = parseInt(slashDashMatch[1], 10);
    const month = parseInt(slashDashMatch[2], 10);
    const year = parseInt(slashDashMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return {
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        yearInferred: false,
      };
    }
  }

  // 3. DD Month (YYYY optional) e.g. "13 November 2026" or "13 Nov"
  const tokens = cleaned.split(/\s+/);
  if (tokens.length >= 2) {
    // Check if format is "13 November 2026"
    const firstNum = parseInt(tokens[0], 10);
    const secondMonth = tokens[1]?.toLowerCase();
    if (!isNaN(firstNum) && MONTH_NAMES[secondMonth]) {
      const monthNum = MONTH_NAMES[secondMonth];
      let year = defaultYear;
      let yearInferred = true;
      if (tokens[2] && /^\d{4}$/.test(tokens[2])) {
        year = parseInt(tokens[2], 10);
        yearInferred = false;
      }
      return {
        date: `${year}-${String(monthNum).padStart(2, '0')}-${String(firstNum).padStart(2, '0')}`,
        yearInferred,
      };
    }

    // Check if format is "November 13 2026"
    const firstMonth = tokens[0]?.toLowerCase();
    const secondNum = parseInt(tokens[1], 10);
    if (MONTH_NAMES[firstMonth] && !isNaN(secondNum)) {
      const monthNum = MONTH_NAMES[firstMonth];
      let year = defaultYear;
      let yearInferred = true;
      if (tokens[2] && /^\d{4}$/.test(tokens[2])) {
        year = parseInt(tokens[2], 10);
        yearInferred = false;
      }
      return {
        date: `${year}-${String(monthNum).padStart(2, '0')}-${String(secondNum).padStart(2, '0')}`,
        yearInferred,
      };
    }
  }

  return null;
}

/**
 * Pretty-formats "YYYY-MM-DD" into e.g. "Fri, 13 Nov 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats 24h "HH:mm" into 12h e.g. "10:00 AM"
 */
export function formatDisplayTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Checks if targetDate is within the next 24 hours relative to a base date.
 */
export function isWithinHours(
  targetDateStr: string,
  targetTimeStr: string | null,
  baseDate: Date,
  hoursThreshold: number = 24
): boolean {
  if (!targetDateStr) return false;
  const [y, m, d] = targetDateStr.split('-').map((v) => parseInt(v, 10));
  let h = 23;
  let min = 59;
  if (targetTimeStr) {
    const [th, tmin] = targetTimeStr.split(':').map((v) => parseInt(v, 10));
    h = th;
    min = tmin;
  }
  const targetDate = new Date(y, m - 1, d, h, min);
  const diffMs = targetDate.getTime() - baseDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= hoursThreshold;
}
