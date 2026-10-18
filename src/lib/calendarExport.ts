import { AcademicEvent } from '../types';

/**
 * Escapes characters according to iCalendar RFC 5545 specification.
 */
function escapeICS(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Converts date (YYYY-MM-DD) and time (HH:mm) to ICS format YYYYMMDDTHHMMSS
 */
function formatICSTimestamp(dateStr: string, timeStr: string | null): string {
  const cleanDate = dateStr.replace(/-/g, '');
  if (!timeStr) {
    return `${cleanDate}T090000`; // Default to 09:00 AM if no time provided
  }
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Generates an RFC 5545 compliant .ics string from an array of AcademicEvents.
 */
export function generateICSContent(events: AcademicEvent[]): string {
  // Only export active and non-superseded events
  const exportable = events.filter(
    (e) => e.lifecycleStatus === 'active' && e.verificationStatus !== 'incomplete'
  );

  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Notice Decoder//Academic Change Intelligence v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Notice Decoder Academic Schedule',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const event of exportable) {
    const isDeadline = event.eventType === 'deadline' || Boolean(event.deadlineTime);
    let dtStart: string;
    let dtEnd: string;

    if (isDeadline && event.deadlineTime) {
      dtStart = formatICSTimestamp(event.date, event.deadlineTime);
      // Give deadline a 15-minute slot on calendar
      const [h, m] = event.deadlineTime.split(':').map((v) => parseInt(v, 10));
      const endM = (m + 15) % 60;
      const endH = (h + Math.floor((m + 15) / 60)) % 24;
      const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      dtEnd = formatICSTimestamp(event.date, endTimeStr);
    } else {
      dtStart = formatICSTimestamp(event.date, event.startTime);
      dtEnd = formatICSTimestamp(event.date, event.endTime || event.startTime);
    }

    const summaryPrefix = isDeadline ? '[DEADLINE] ' : event.eventType === 'exam' ? '[EXAM] ' : '';
    const summary = escapeICS(`${summaryPrefix}${event.title}`);
    const location = escapeICS(event.venue || 'Academic Campus');
    const description = escapeICS(
      `Notice Decoder Extracted Event\nType: ${event.eventType}\nNotice Excerpt: "${event.sourceExcerpt}"\nVerification: ${event.verificationStatus}`
    );

    ics.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@noticedecoder.internal`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Triggers a browser file download for the calendar .ics
 */
export function downloadICSFile(filename: string, icsContent: string): boolean {
  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to download calendar file:', err);
    return false;
  }
}
