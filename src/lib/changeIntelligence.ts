import { AcademicEvent, ChangeRecord, Notice } from '../types';
import { formatDisplayDate, formatDisplayTime, timeToMinutes } from './dateTime';

/**
 * Calculates string similarity / token overlap between two event titles.
 */
function calculateTitleSimilarity(a: string, b: string): number {
  const normA = a.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const normB = b.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (normA === normB) return 1.0;

  const tokensA = new Set(normA.split(/\s+/).filter((t) => t.length > 2));
  const tokensB = new Set(normB.split(/\s+/).filter((t) => t.length > 2));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }

  return (2 * intersection) / (tokensA.size + tokensB.size);
}

/**
 * Compares candidate events from a new notice with existing active events.
 */
export function detectNoticeChanges(
  candidates: AcademicEvent[],
  existingEvents: AcademicEvent[],
  sourceNotice: Notice
): { changes: ChangeRecord[]; brandNewEvents: AcademicEvent[] } {
  const changes: ChangeRecord[] = [];
  const brandNewEvents: AcademicEvent[] = [];

  const activeExisting = existingEvents.filter(
    (e) => e.lifecycleStatus === 'active' || e.lifecycleStatus === 'needs_review'
  );

  for (const candidate of candidates) {
    const rawSentence = candidate.sourceExcerpt.toLowerCase();
    const isExplicitReschedule =
      rawSentence.includes('rescheduled') ||
      rawSentence.includes('revised') ||
      rawSentence.includes('previously scheduled') ||
      rawSentence.includes('postponed');

    const isExplicitCancellation =
      rawSentence.includes('cancelled') ||
      rawSentence.includes('called off') ||
      rawSentence.includes('will not be held');

    // Find best matching existing event
    let bestMatch: AcademicEvent | null = null;
    let highestSim = 0;

    for (const existing of activeExisting) {
      const sim = calculateTitleSimilarity(candidate.title, existing.title);
      if (sim > highestSim) {
        highestSim = sim;
        bestMatch = existing;
      }
    }

    // Match threshold: >= 0.5 or high similarity
    if (bestMatch && highestSim >= 0.45) {
      // Check what changed
      const isDateChanged = candidate.date !== bestMatch.date;
      const isTimeChanged =
        candidate.startTime !== bestMatch.startTime ||
        candidate.endTime !== bestMatch.endTime;
      const isDeadlineChanged = candidate.deadlineTime !== bestMatch.deadlineTime;
      const isVenueChanged =
        candidate.venue &&
        bestMatch.venue &&
        candidate.venue.toLowerCase() !== bestMatch.venue.toLowerCase();

      // Check if duplicate (identical)
      if (
        !isDateChanged &&
        !isTimeChanged &&
        !isDeadlineChanged &&
        !isVenueChanged &&
        !isExplicitReschedule &&
        !isExplicitCancellation
      ) {
        changes.push({
          id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          targetEventId: bestMatch.id,
          targetEventTitle: bestMatch.title,
          sourceNoticeId: sourceNotice.id,
          sourceNoticeTitle: sourceNotice.title,
          previousValues: {
            date: bestMatch.date,
            startTime: bestMatch.startTime,
            endTime: bestMatch.endTime,
            deadlineTime: bestMatch.deadlineTime,
            venue: bestMatch.venue,
          },
          proposedValues: {
            date: candidate.date,
            startTime: candidate.startTime,
            endTime: candidate.endTime,
            deadlineTime: candidate.deadlineTime,
            venue: candidate.venue,
          },
          changeClassification: 'duplicate',
          supportingEvidence: candidate.sourceExcerpt,
          impactAnalysis: `Notice restates existing event "${bestMatch.title}" with matching schedule and venue. No schedule conflict introduced.`,
          reviewStatus: 'confirmed',
          confidence: 'high',
          detectedAt: new Date().toISOString(),
        });
        continue;
      }

      // Explicit cancellation
      if (isExplicitCancellation) {
        changes.push({
          id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          targetEventId: bestMatch.id,
          targetEventTitle: bestMatch.title,
          sourceNoticeId: sourceNotice.id,
          sourceNoticeTitle: sourceNotice.title,
          previousValues: {
            lifecycleStatus: bestMatch.lifecycleStatus,
          },
          proposedValues: {
            lifecycleStatus: 'cancelled',
          },
          changeClassification: 'cancelled',
          supportingEvidence: candidate.sourceExcerpt,
          impactAnalysis: `Event "${bestMatch.title}" is explicitly cancelled by this announcement. Accepting removes this event from active schedule conflicts.`,
          reviewStatus: 'pending',
          confidence: 'high',
          detectedAt: new Date().toISOString(),
        });
        continue;
      }

      // Reschedule or time change
      let classification: ChangeRecord['changeClassification'] = 'rescheduled';
      if (isDateChanged && isTimeChanged) classification = 'rescheduled';
      else if (isTimeChanged) classification = 'time_change';
      else if (isVenueChanged) classification = 'venue_change';
      else if (isDeadlineChanged) classification = 'deadline_change';
      else if (!isExplicitReschedule) classification = 'ambiguous';

      // Impact analysis explanation
      let impact = `Modifies schedule for "${bestMatch.title}". `;
      if (isTimeChanged) {
        impact += `Time shifted from ${formatDisplayTime(bestMatch.startTime)}–${formatDisplayTime(bestMatch.endTime)} to ${formatDisplayTime(candidate.startTime)}–${formatDisplayTime(candidate.endTime)}. `;
      }
      if (isDateChanged) {
        impact += `Date moved from ${formatDisplayDate(bestMatch.date)} to ${formatDisplayDate(candidate.date)}. `;
      }
      if (isVenueChanged) {
        impact += `Venue relocated from ${bestMatch.venue || 'TBD'} to ${candidate.venue}. `;
      }

      // Check if rescheduling resolves any previous overlap
      const otherEvents = activeExisting.filter((e) => e.id !== bestMatch!.id);
      const prevConflicts = otherEvents.filter((other) => {
        if (!other.startTime || !other.endTime || !bestMatch!.startTime || !bestMatch!.endTime)
          return false;
        if (other.date !== bestMatch!.date) return false;
        const sA = timeToMinutes(bestMatch!.startTime);
        const eA = timeToMinutes(bestMatch!.endTime);
        const sB = timeToMinutes(other.startTime);
        const eB = timeToMinutes(other.endTime);
        return sA < eB && sB < eA;
      });

      if (prevConflicts.length > 0 && candidate.startTime && candidate.endTime) {
        const newStart = timeToMinutes(candidate.startTime);
        const newEnd = timeToMinutes(candidate.endTime);
        const stillConflicted = prevConflicts.some((other) => {
          if (other.date !== candidate.date) return false;
          const sB = timeToMinutes(other.startTime!);
          const eB = timeToMinutes(other.endTime!);
          return newStart < eB && sB < newEnd;
        });

        if (!stillConflicted) {
          impact += `\n✓ Resolves schedule overlap with ${prevConflicts.map((p) => `"${p.title}"`).join(', ')}.`;
        }
      }

      changes.push({
        id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        targetEventId: bestMatch.id,
        targetEventTitle: bestMatch.title,
        sourceNoticeId: sourceNotice.id,
        sourceNoticeTitle: sourceNotice.title,
        previousValues: {
          date: bestMatch.date,
          startTime: bestMatch.startTime,
          endTime: bestMatch.endTime,
          deadlineTime: bestMatch.deadlineTime,
          venue: bestMatch.venue,
        },
        proposedValues: {
          date: candidate.date,
          startTime: candidate.startTime,
          endTime: candidate.endTime,
          deadlineTime: candidate.deadlineTime,
          venue: candidate.venue,
        },
        changeClassification: classification,
        supportingEvidence: candidate.sourceExcerpt,
        impactAnalysis: impact.trim(),
        reviewStatus: 'pending',
        confidence: isExplicitReschedule ? 'high' : 'medium',
        detectedAt: new Date().toISOString(),
      });
    } else {
      // No match found -> brand new event
      brandNewEvents.push(candidate);
    }
  }

  return { changes, brandNewEvents };
}

/**
 * Applies or rejects a change record.
 * Never silently overwrites history; archives old values and updates active event.
 */
export function applyChangeDecision(
  record: ChangeRecord,
  events: AcademicEvent[],
  action: 'confirm' | 'reject'
): { updatedEvents: AcademicEvent[]; updatedRecord: ChangeRecord } {
  const now = new Date().toISOString();
  const updatedRecord: ChangeRecord = {
    ...record,
    reviewStatus: action === 'confirm' ? 'confirmed' : 'rejected',
    confirmedAt: now,
  };

  const updatedEvents = events.map((event) => {
    if (event.id !== record.targetEventId) return event;

    if (action === 'confirm') {
      if (record.changeClassification === 'cancelled') {
        return {
          ...event,
          lifecycleStatus: 'cancelled' as const,
          updatedAt: now,
        };
      }

      // Update fields while preserving original in record
      return {
        ...event,
        date: record.proposedValues.date || event.date,
        startTime:
          record.proposedValues.startTime !== undefined
            ? record.proposedValues.startTime
            : event.startTime,
        endTime:
          record.proposedValues.endTime !== undefined
            ? record.proposedValues.endTime
            : event.endTime,
        deadlineTime:
          record.proposedValues.deadlineTime !== undefined
            ? record.proposedValues.deadlineTime
            : event.deadlineTime,
        venue:
          record.proposedValues.venue !== undefined
            ? record.proposedValues.venue
            : event.venue,
        verificationStatus: 'verified' as const,
        lifecycleStatus: 'active' as const,
        updatedAt: now,
      };
    } else {
      // Rejected: keep existing values, clear needs_review flag
      return {
        ...event,
        lifecycleStatus: event.lifecycleStatus === 'needs_review' ? 'active' : event.lifecycleStatus,
        updatedAt: now,
      };
    }
  });

  return { updatedEvents, updatedRecord };
}
