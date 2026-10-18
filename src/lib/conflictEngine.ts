import { AcademicEvent, Conflict } from '../types';
import { timeToMinutes, formatDisplayTime, formatDisplayDate } from './dateTime';

/**
 * Pure conflict detection engine.
 * Computes overlaps between timed events and collisions between deadlines and scheduled events.
 */
export function detectConflicts(events: AcademicEvent[]): Conflict[] {
  const activeEvents = events.filter(
    (e) => e.lifecycleStatus === 'active' && e.date && (e.startTime || e.deadlineTime)
  );

  const conflicts: Conflict[] = [];

  // Group events by date
  const eventsByDate = new Map<string, AcademicEvent[]>();
  for (const event of activeEvents) {
    const list = eventsByDate.get(event.date) || [];
    list.push(event);
    eventsByDate.set(event.date, list);
  }

  // Iterate over each date
  for (const [date, dateEvents] of eventsByDate.entries()) {
    const n = dateEvents.length;

    for (let i = 0; i < n; i++) {
      const eventA = dateEvents[i];

      for (let j = i + 1; j < n; j++) {
        const eventB = dateEvents[j];

        // Case 1: Both events are timed interval events (have startTime and endTime)
        if (eventA.startTime && eventA.endTime && eventB.startTime && eventB.endTime) {
          const startA = timeToMinutes(eventA.startTime);
          const endA = timeToMinutes(eventA.endTime);
          const startB = timeToMinutes(eventB.startTime);
          const endB = timeToMinutes(eventB.endTime);

          // Pure interval intersection rule: startA < endB && startB < endA
          if (startA < endB && startB < endA) {
            const overlapStartMin = Math.max(startA, startB);
            const overlapEndMin = Math.min(endA, endB);
            const overlapMinutes = overlapEndMin - overlapStartMin;

            const isSameVenue =
              eventA.venue &&
              eventB.venue &&
              eventA.venue.trim().toLowerCase() === eventB.venue.trim().toLowerCase();

            const isExamInvolved = eventA.eventType === 'exam' || eventB.eventType === 'exam';

            conflicts.push({
              id: `conflict-overlap-${eventA.id}-${eventB.id}`,
              type: isSameVenue ? 'venue_clash' : 'overlap',
              eventIds: [eventA.id, eventB.id],
              eventTitles: [eventA.title, eventB.title],
              date,
              overlapMinutes,
              severity: isExamInvolved ? 'critical' : 'high',
              explanation: `Direct schedule overlap of ${overlapMinutes} minutes between "${eventA.title}" (${formatDisplayTime(eventA.startTime)} – ${formatDisplayTime(eventA.endTime)}) and "${eventB.title}" (${formatDisplayTime(eventB.startTime)} – ${formatDisplayTime(eventB.endTime)}) on ${formatDisplayDate(date)}.`,
              sourceEvidence: [
                `"${eventA.title}": ${eventA.sourceExcerpt}`,
                `"${eventB.title}": ${eventB.sourceExcerpt}`,
              ],
            });
          }
        }

        // Case 2: Deadline collision with a timed event
        // Event A is timed event, Event B is deadline
        checkDeadlineCollision(eventA, eventB, date, conflicts);
        // Event B is timed event, Event A is deadline
        checkDeadlineCollision(eventB, eventA, date, conflicts);
      }
    }
  }

  return conflicts;
}

/**
 * Checks if deadline in eventB falls strictly inside the scheduled interval of eventA.
 * Rule: S <= D && D < E
 */
function checkDeadlineCollision(
  timedEvent: AcademicEvent,
  deadlineEvent: AcademicEvent,
  date: string,
  conflicts: Conflict[]
) {
  if (
    timedEvent.startTime &&
    timedEvent.endTime &&
    deadlineEvent.deadlineTime &&
    deadlineEvent.eventType === 'deadline'
  ) {
    const s = timeToMinutes(timedEvent.startTime);
    const e = timeToMinutes(timedEvent.endTime);
    const d = timeToMinutes(deadlineEvent.deadlineTime);

    // Rule: S <= D && D < E
    if (s <= d && d < e) {
      conflicts.push({
        id: `conflict-deadline-${deadlineEvent.id}-${timedEvent.id}`,
        type: 'deadline_collision',
        eventIds: [deadlineEvent.id, timedEvent.id],
        eventTitles: [deadlineEvent.title, timedEvent.title],
        date,
        severity: 'high',
        explanation: `Submission deadline for "${deadlineEvent.title}" at ${formatDisplayTime(deadlineEvent.deadlineTime)} occurs directly during "${timedEvent.title}" (${formatDisplayTime(timedEvent.startTime)} – ${formatDisplayTime(timedEvent.endTime)}) on ${formatDisplayDate(date)}.`,
        sourceEvidence: [
          `Deadline "${deadlineEvent.title}": ${deadlineEvent.sourceExcerpt}`,
          `Scheduled event "${timedEvent.title}": ${timedEvent.sourceExcerpt}`,
        ],
      });
    }
  }
}
