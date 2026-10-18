import { AcademicEvent, ChangeRecord, Conflict, ImpactRadarItem } from '../types';
import { formatDisplayDate, formatDisplayTime } from './dateTime';

export interface ImpactRadarSummary {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  informationalCount: number;
  deadlineClusters: { date: string; count: number; eventTitles: string[] }[];
  items: ImpactRadarItem[];
}

/**
 * Computes the Academic Impact Radar based on real active events, conflicts, and pending changes.
 */
export function calculateAcademicImpactRadar(
  events: AcademicEvent[],
  conflicts: Conflict[],
  changes: ChangeRecord[]
): ImpactRadarSummary {
  const items: ImpactRadarItem[] = [];

  // 1. Conflict items (Active overlaps & deadline collisions)
  for (const conflict of conflicts) {
    if (conflict.dismissed) continue;

    items.push({
      id: `radar-conflict-${conflict.id}`,
      severity: conflict.severity,
      title:
        conflict.type === 'overlap'
          ? `Direct Schedule Overlap (${conflict.overlapMinutes} min)`
          : conflict.type === 'deadline_collision'
          ? 'Submission Deadline Collision'
          : 'Room / Venue Allocation Clash',
      description: conflict.explanation,
      affectedEventIds: conflict.eventIds,
      category: 'conflict',
      actionRecommendation:
        conflict.type === 'overlap'
          ? 'Reschedule or inform course instructors about simultaneous sessions.'
          : 'Plan submission prior to the overlapping lecture/event to avoid missing the cutoff.',
    });
  }

  // 2. Pending revision items (Changes awaiting student review)
  const pendingChanges = changes.filter((c) => c.reviewStatus === 'pending');
  for (const change of pendingChanges) {
    items.push({
      id: `radar-change-${change.id}`,
      severity: change.changeClassification === 'cancelled' ? 'critical' : 'high',
      title: `Notice Revision: ${change.targetEventTitle}`,
      description: change.impactAnalysis,
      affectedEventIds: [change.targetEventId],
      sourceNoticeId: change.sourceNoticeId,
      category: 'revision',
      actionRecommendation: 'Review side-by-side comparison and confirm or reject to update your calendar.',
    });
  }

  // 3. Deadline clustering (Deadlines falling on the same date)
  const activeEvents = events.filter((e) => e.lifecycleStatus === 'active');
  const deadlinesByDate = new Map<string, AcademicEvent[]>();

  for (const event of activeEvents) {
    if (event.eventType === 'deadline' || event.deadlineTime) {
      const list = deadlinesByDate.get(event.date) || [];
      list.push(event);
      deadlinesByDate.set(event.date, list);
    }
  }

  const deadlineClusters: { date: string; count: number; eventTitles: string[] }[] = [];
  for (const [date, deadlineList] of deadlinesByDate.entries()) {
    if (deadlineList.length >= 2) {
      deadlineClusters.push({
        date,
        count: deadlineList.length,
        eventTitles: deadlineList.map((d) => d.title),
      });

      items.push({
        id: `radar-cluster-${date}`,
        severity: deadlineList.length >= 3 ? 'high' : 'medium',
        title: `Deadline Cluster: ${deadlineList.length} submissions on ${formatDisplayDate(date)}`,
        description: `Multiple academic submissions converge on this single day: ${deadlineList.map((d) => `"${d.title}" (${formatDisplayTime(d.deadlineTime)})`).join(', ')}.`,
        affectedEventIds: deadlineList.map((d) => d.id),
        category: 'deadline_cluster',
        actionRecommendation: 'Begin deliverables ahead of time to prevent last-minute submission bottlenecks.',
      });
    }
  }

  // 4. Verification items (Events with incomplete or uncertain fields)
  const incompleteEvents = activeEvents.filter(
    (e) => e.verificationStatus === 'incomplete' || e.uncertainFields.length > 0
  );
  for (const unverified of incompleteEvents) {
    items.push({
      id: `radar-verify-${unverified.id}`,
      severity: 'medium',
      title: `Unverified Notice Data: "${unverified.title}"`,
      description: `Missing or uncertain attributes: [${unverified.uncertainFields.join(', ')}]. Extracted from notice without unambiguous confirmation.`,
      affectedEventIds: [unverified.id],
      sourceNoticeId: unverified.sourceNoticeId,
      category: 'verification_needed',
      actionRecommendation: 'Review original notice text and verify or edit the event details.',
    });
  }

  // Count severities
  const criticalCount = items.filter((i) => i.severity === 'critical').length;
  const highCount = items.filter((i) => i.severity === 'high').length;
  const mediumCount = items.filter((i) => i.severity === 'medium').length;
  const informationalCount = items.filter((i) => i.severity === 'informational').length;

  return {
    criticalCount,
    highCount,
    mediumCount,
    informationalCount,
    deadlineClusters,
    items,
  };
}
