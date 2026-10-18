import { AcademicEvent, AssistantMessage, ChangeRecord, Conflict, Notice } from '../types';
import { formatDisplayDate, formatDisplayTime } from './dateTime';

interface AssistantContext {
  notices: Notice[];
  events: AcademicEvent[];
  conflicts: Conflict[];
  changes: ChangeRecord[];
}

/**
 * Handles answering assistant queries either via backend Gemini API or deterministic local engine.
 */
export async function queryAssistant(
  userQuery: string,
  context: AssistantContext
): Promise<AssistantMessage> {
  const queryLower = userQuery.toLowerCase().trim();

  // Try server-side AI endpoint first
  try {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: userQuery,
        context: {
          noticesCount: context.notices.length,
          notices: context.notices.map((n) => ({ id: n.id, title: n.title, text: n.rawText })),
          activeEvents: context.events
            .filter((e) => e.lifecycleStatus === 'active')
            .map((e) => ({
              id: e.id,
              title: e.title,
              type: e.eventType,
              date: e.date,
              time: e.startTime ? `${e.startTime}–${e.endTime}` : e.deadlineTime,
              venue: e.venue,
              excerpt: e.sourceExcerpt,
            })),
          conflicts: context.conflicts.map((c) => ({
            id: c.id,
            severity: c.severity,
            type: c.type,
            explanation: c.explanation,
            eventTitles: c.eventTitles,
          })),
          changes: context.changes.map((ch) => ({
            id: ch.id,
            event: ch.targetEventTitle,
            classification: ch.changeClassification,
            status: ch.reviewStatus,
            impact: ch.impactAnalysis,
            evidence: ch.supportingEvidence,
          })),
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.answer) {
        return {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toISOString(),
          sources: buildSourcesFromContext(queryLower, context),
          isLocalFallback: false,
        };
      }
    }
  } catch (err) {
    // Graceful fallback to deterministic local engine
    console.warn('Backend AI unavailable, falling back to local deterministic engine');
  }

  // Pure Deterministic Grounded Assistant Engine
  return generateDeterministicResponse(userQuery, context);
}

function generateDeterministicResponse(
  query: string,
  context: AssistantContext
): AssistantMessage {
  const q = query.toLowerCase();
  const activeEvents = context.events.filter((e) => e.lifecycleStatus === 'active');
  const sources: AssistantMessage['sources'] = [];

  let content = '';

  // 1. "What changed in my notices?" / Revisions / Changes
  if (q.includes('change') || q.includes('revised') || q.includes('reschedul')) {
    if (context.changes.length === 0) {
      content = `**Notice Change Intelligence Report:**\n\nNo revisions or schedule changes have been detected across your ${context.notices.length} processed notices. All active events match their original announcements.`;
    } else {
      content = `**Notice Change Intelligence Report (${context.changes.length} detected):**\n\n`;
      for (const ch of context.changes) {
        const statusBadge = ch.reviewStatus === 'confirmed' ? '✓ Confirmed' : ch.reviewStatus === 'rejected' ? '✗ Rejected' : '⚠️ Pending Review';
        content += `- **${ch.targetEventTitle}** (${ch.changeClassification.toUpperCase()} — ${statusBadge})\n`;
        content += `  - **Evidence:** "${ch.supportingEvidence}"\n`;
        content += `  - **Schedule Impact:** ${ch.impactAnalysis}\n`;
        if (ch.previousValues.startTime && ch.proposedValues.startTime) {
          content += `  - **Delta:** Moved from ${formatDisplayTime(ch.previousValues.startTime)}–${formatDisplayTime(ch.previousValues.endTime || null)} to ${formatDisplayTime(ch.proposedValues.startTime)}–${formatDisplayTime(ch.proposedValues.endTime || null)}.\n`;
        }
        sources.push({
          noticeId: ch.sourceNoticeId,
          noticeTitle: ch.sourceNoticeTitle,
          excerpt: ch.supportingEvidence,
          eventId: ch.targetEventId,
          eventTitle: ch.targetEventTitle,
        });
      }
    }
  }

  // 2. "Explain conflicts" / Overlaps / Collisions
  else if (q.includes('conflict') || q.includes('overlap') || q.includes('collision')) {
    if (context.conflicts.length === 0) {
      content = `**Conflict Engine Status: Clear**\n\nNo overlapping sessions or deadline collisions exist in your active schedule. All timed events have non-intersecting intervals (\`startA < endB && startB < endA\` evaluated as false).`;
    } else {
      content = `**Detected Schedule Conflicts (${context.conflicts.length} active):**\n\n`;
      for (const cf of context.conflicts) {
        const severityTag = cf.severity === 'critical' ? '🔴 CRITICAL' : '🟠 HIGH';
        content += `### ${severityTag}: ${cf.type === 'overlap' ? 'Direct Overlap' : 'Deadline Collision'}\n`;
        content += `- **Explanation:** ${cf.explanation}\n`;
        content += `- **Events Involved:** ${cf.eventTitles.join(' & ')}\n`;
        content += `- **Date:** ${formatDisplayDate(cf.date)}\n`;
        if (cf.overlapMinutes) {
          content += `- **Duration of Conflict:** ${cf.overlapMinutes} minutes\n`;
        }
        for (const ev of cf.sourceEvidence) {
          content += `  - *Source:* ${ev}\n`;
        }
      }
      content += `\n**Recommended Action:** Confirm the revised schedule notice in the Change Review tab to resolve these collisions.`;
    }
  }

  // 3. "Which deadlines are coming up?"
  else if (q.includes('deadline') || q.includes('due') || q.includes('submit')) {
    const deadlines = activeEvents.filter((e) => e.eventType === 'deadline' || e.deadlineTime);
    if (deadlines.length === 0) {
      content = `**Upcoming Deadlines:**\n\nNo upcoming submission deadlines are registered in your notices.`;
    } else {
      content = `**Upcoming Academic Deadlines (${deadlines.length} recorded):**\n\n`;
      for (const d of deadlines) {
        content += `- **${d.title}**\n`;
        content += `  - **Due:** ${formatDisplayDate(d.date)} at ${formatDisplayTime(d.deadlineTime || d.startTime)}\n`;
        content += `  - **Location / Submission Point:** ${d.venue || 'Specified in notice'}\n`;
        content += `  - **Notice Evidence:** "${d.sourceExcerpt}"\n`;
        sources.push({
          noticeId: d.sourceNoticeId,
          excerpt: d.sourceExcerpt,
          eventId: d.id,
          eventTitle: d.title,
        });
      }
    }
  }

  // 4. "Show source for exam" / "Where was this announced?"
  else if (q.includes('source') || q.includes('exam') || q.includes('evidence')) {
    const exams = activeEvents.filter((e) => e.eventType === 'exam' || e.title.toLowerCase().includes('exam') || e.title.toLowerCase().includes('test'));
    if (exams.length === 0) {
      content = `**Source Evidence Verification:**\n\nNo examination events are found in your active schedule.`;
    } else {
      content = `**Verified Source Evidence for Examinations:**\n\n`;
      for (const ex of exams) {
        content += `- **${ex.title}**\n`;
        content += `  - **Scheduled Date & Time:** ${formatDisplayDate(ex.date)}, ${formatDisplayTime(ex.startTime)} – ${formatDisplayTime(ex.endTime)}\n`;
        content += `  - **Venue:** ${ex.venue || 'Unspecified'}\n`;
        content += `  - **Exact Notice Excerpt:** "${ex.sourceExcerpt}"\n`;
        content += `  - **Verification Status:** ${ex.verificationStatus.toUpperCase()}\n`;
        sources.push({
          noticeId: ex.sourceNoticeId,
          excerpt: ex.sourceExcerpt,
          eventId: ex.id,
          eventTitle: ex.title,
        });
      }
    }
  }

  // 5. "What should I verify before exporting?"
  else if (q.includes('verify') || q.includes('export') || q.includes('ready')) {
    const incomplete = activeEvents.filter(
      (e) => e.verificationStatus === 'incomplete' || e.uncertainFields.length > 0
    );
    const unconfirmedChanges = context.changes.filter((c) => c.reviewStatus === 'pending');

    content = `**Pre-Export Verification Checklist:**\n\n`;
    if (incomplete.length === 0 && unconfirmedChanges.length === 0 && context.conflicts.length === 0) {
      content += `✓ **All checks passed!** Your academic schedule is verified, all notices are reconciled, and no schedule overlaps exist. You can safely download your \`.ics\` calendar file.`;
    } else {
      if (unconfirmedChanges.length > 0) {
        content += `⚠️ **${unconfirmedChanges.length} Pending Notice Revision(s):**\n`;
        for (const ch of unconfirmedChanges) {
          content += `  - "${ch.targetEventTitle}" has an unconfirmed change notice: "${ch.supportingEvidence}". Please confirm or reject before exporting.\n`;
        }
      }
      if (context.conflicts.length > 0) {
        content += `⚠️ **${context.conflicts.length} Active Schedule Conflict(s):**\n`;
        for (const cf of context.conflicts) {
          content += `  - ${cf.explanation}\n`;
        }
      }
      if (incomplete.length > 0) {
        content += `⚠️ **${incomplete.length} Event(s) with Incomplete Fields:**\n`;
        for (const inc of incomplete) {
          content += `  - "${inc.title}" has uncertain fields: [${inc.uncertainFields.join(', ')}]. Click "Edit" on the event card to confirm.\n`;
        }
      }
    }
  }

  // 6. Generic Schedule Overview / Help
  else {
    content = `**Notice Decoder Nexa AI Summary:**\n\n`;
    content += `- **Total Processed Notices:** ${context.notices.length}\n`;
    content += `- **Active Scheduled Events:** ${activeEvents.length}\n`;
    content += `- **Detected Revisions:** ${context.changes.length} (${context.changes.filter((c) => c.reviewStatus === 'pending').length} pending review)\n`;
    content += `- **Active Schedule Conflicts:** ${context.conflicts.length}\n\n`;
    content += `**Key Highlights:**\n`;
    for (const ev of activeEvents.slice(0, 4)) {
      content += `- **${ev.title}**: ${formatDisplayDate(ev.date)} (${ev.startTime ? `${formatDisplayTime(ev.startTime)}–${formatDisplayTime(ev.endTime)}` : formatDisplayTime(ev.deadlineTime)} at ${ev.venue || 'TBD'})\n`;
    }
    content += `\nYou can ask about specific events, request conflict explanations, or inquire about notice revisions anytime.`;
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    sources,
    isLocalFallback: true,
  };
}

function buildSourcesFromContext(
  q: string,
  context: AssistantContext
): AssistantMessage['sources'] {
  const sources: AssistantMessage['sources'] = [];
  for (const n of context.notices) {
    if (q.includes('exam') && n.rawText.toLowerCase().includes('exam')) {
      sources.push({ noticeId: n.id, noticeTitle: n.title, excerpt: n.rawText.slice(0, 150) });
    }
  }
  return sources.slice(0, 3);
}
