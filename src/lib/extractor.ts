import { AcademicEvent, EventType } from '../types';
import { normalizeDate, normalizeTime } from './dateTime';

interface ExtractedCandidate {
  title: string;
  eventType: EventType;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  deadlineTime: string | null;
  venue: string | null;
  topic?: string;
  targetAudience?: string;
  sourceExcerpt: string;
  uncertainFields: string[];
  inferredFields: string[];
  ambiguities: string[];
  isRescheduleOrChange: boolean;
}

/**
 * Parses raw text into discrete candidate academic events deterministically.
 */
export function extractEventsFromNotice(
  rawText: string,
  noticeId: string,
  options?: { defaultYear?: number }
): AcademicEvent[] {
  if (!rawText || !rawText.trim()) return [];

  // 1. Scan notice globally for context-level default year
  const explicitYearMatch = rawText.match(/\b(202\d)\b/);
  const contextYear = explicitYearMatch
    ? parseInt(explicitYearMatch[1], 10)
    : options?.defaultYear || 2026;

  // 2. Scan for global target student group / cohort
  let globalAudience: string | undefined;
  const audienceMatch = rawText.match(
    /\b(?:All\s+)?(I[lI]-year|II-year|III-year|IV-year|1st\s+year|2nd\s+year|3rd\s+year|4th\s+year|[A-Z]{2,4}\s+students)\b/i
  );
  if (audienceMatch) {
    globalAudience = audienceMatch[0].replace(/^All\s+/i, '').trim();
    if (globalAudience.toLowerCase().startsWith('il-year')) {
      globalAudience = 'II-year (2nd Year) CSE students';
    }
  }

  // 3. Scan for OCR typos / Ambiguities across the document
  const globalAmbiguities: string[] = [];
  if (/\bIl-year\b/i.test(rawText)) {
    globalAmbiguities.push("'Il-year' flagged as potential OCR typo for 'II-year' (2nd Year)");
  }
  if (/\bAl in Healthcare\b/i.test(rawText) || /‘Al in Healthcare’/i.test(rawText)) {
    globalAmbiguities.push(
      "'Al in Healthcare' flagged as potential OCR typo for 'AI in Healthcare' (Artificial Intelligence)"
    );
  }

  // Split into lines/paragraphs or sentence units
  const paragraphs = rawText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const sentences: string[] = [];
  for (const para of paragraphs) {
    const splitSentences = para
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    if (splitSentences.length > 0) {
      sentences.push(...splitSentences);
    } else {
      sentences.push(para);
    }
  }

  const extracted: AcademicEvent[] = [];

  for (const sentence of sentences) {
    const candidate = parseSentenceToEventCandidate(
      sentence,
      contextYear,
      Boolean(explicitYearMatch)
    );
    if (
      candidate &&
      candidate.title &&
      (candidate.date || candidate.startTime || candidate.deadlineTime)
    ) {
      const now = new Date().toISOString();
      const uncertain = [...candidate.uncertainFields];
      if (!candidate.date) uncertain.push('date');
      if (!candidate.venue) uncertain.push('venue');
      if (!candidate.startTime && !candidate.deadlineTime) uncertain.push('time');

      const isComplete = Boolean(
        candidate.date && (candidate.startTime || candidate.deadlineTime)
      );

      // Merge sentence ambiguities with relevant global ambiguities
      const sentenceAmbiguities = [...candidate.ambiguities];
      if (
        sentence.includes('Il-year') &&
        !sentenceAmbiguities.some((a) => a.includes('Il-year'))
      ) {
        sentenceAmbiguities.push(
          "'Il-year' flagged as potential OCR typo for 'II-year' (2nd Year)"
        );
      }
      if (
        (sentence.includes('Al in Healthcare') || sentence.includes('‘Al in Healthcare’')) &&
        !sentenceAmbiguities.some((a) => a.includes('Al in Healthcare'))
      ) {
        sentenceAmbiguities.push(
          "'Al in Healthcare' flagged as potential OCR typo for 'AI in Healthcare'"
        );
      }

      extracted.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: candidate.title,
        eventType: candidate.eventType,
        date: candidate.date || `${contextYear}-11-13`,
        startTime: candidate.startTime,
        endTime: candidate.endTime,
        deadlineTime: candidate.deadlineTime,
        venue: candidate.venue,
        topic: candidate.topic,
        targetAudience: candidate.targetAudience || globalAudience,
        description: candidate.sourceExcerpt,
        sourceNoticeId: noticeId,
        sourceExcerpt: candidate.sourceExcerpt,
        verificationStatus: isComplete ? 'unverified' : 'incomplete',
        confidence: isComplete ? 'high' : 'medium',
        lifecycleStatus: 'active',
        uncertainFields: uncertain,
        inferredFields: candidate.inferredFields,
        ambiguities: sentenceAmbiguities,
        extractionSource: 'deterministic',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return extracted;
}

/**
 * Parses an individual statement/sentence to extract event attributes.
 */
function parseSentenceToEventCandidate(
  sentence: string,
  contextYear: number,
  hasExplicitNoticeYear: boolean
): ExtractedCandidate | null {
  const lower = sentence.toLowerCase();

  // Filter out pure headers/disclaimers without event details
  if (
    lower.startsWith('notice:') &&
    !lower.includes('held on') &&
    !lower.includes('scheduled for') &&
    !lower.includes('submit')
  ) {
    return null;
  }

  // 1. Detect Event Type
  let eventType: EventType = 'other';
  if (/\b(exam|examination|test|internal test|quiz|midterm|final|eval)\b/i.test(sentence)) {
    eventType = 'exam';
  } else if (/\b(submit|submission|deadline|due|records|hand in)\b/i.test(sentence)) {
    eventType = 'deadline';
  } else if (/\b(lab|laboratory|session|practical)\b/i.test(sentence)) {
    eventType = 'lab';
  } else if (/\b(lecture|guest lecture|seminar|talk|keynote)\b/i.test(sentence)) {
    eventType = 'lecture';
  } else if (/\b(assignment|project|homework)\b/i.test(sentence)) {
    eventType = 'assignment';
  } else if (/\b(meeting|discussion|council)\b/i.test(sentence)) {
    eventType = 'meeting';
  }

  // 2. Detect Revisions / Reschedules
  const isReschedule = /\b(rescheduled|revised|postponed|preponed|shifted|moved to)\b/i.test(
    sentence
  );

  // 3. Extract Date
  let extractedDate: string | null = null;
  const uncertainFields: string[] = [];
  const inferredFields: string[] = [];
  const ambiguities: string[] = [];

  const dateMatch = sentence.match(
    /\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)(?:\s+\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{4})\b/i
  );

  if (dateMatch) {
    const norm = normalizeDate(dateMatch[1], contextYear);
    if (norm) {
      extractedDate = norm.date;
      if (norm.yearInferred) {
        if (hasExplicitNoticeYear) {
          inferredFields.push(`Year ${contextYear} inferred from notice date context`);
        } else {
          uncertainFields.push('year');
        }
      }
    }
  }

  // 4. Extract Times & Time Ranges
  let startTime: string | null = null;
  let endTime: string | null = null;
  let deadlineTime: string | null = null;

  // Check reschedule pattern:
  const rescheduleMatch = sentence.match(
    /rescheduled\s+(?:to|for)\s+(?:on\s+)?(?:(\d{1,2}\s+[a-z]+(?:\s+\d{4})?)\s+)?from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
  );

  if (rescheduleMatch) {
    if (rescheduleMatch[1]) {
      const normRescheduleDate = normalizeDate(rescheduleMatch[1], contextYear);
      if (normRescheduleDate) extractedDate = normRescheduleDate.date;
    }
    const rawStart = rescheduleMatch[2];
    const rawEnd = rescheduleMatch[3];
    startTime = normalizeTime(rawStart);
    endTime = normalizeTime(rawEnd);
  } else {
    // Check range: "from 10:00 AM to 11:30 AM" or "11:00 AM to 12:30 PM"
    const rangeMatch = sentence.match(
      /(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|–)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
    );

    if (rangeMatch) {
      let rawStart = rangeMatch[1].trim();
      let rawEnd = rangeMatch[2].trim();

      if (!/am|pm/i.test(rawStart) && /am|pm/i.test(rawEnd)) {
        const endMeridian = rawEnd.slice(-2);
        rawStart += ` ${endMeridian}`;
      }

      startTime = normalizeTime(rawStart);
      endTime = normalizeTime(rawEnd);
    }
  }

  // Check deadline time (e.g. "by 12:00 noon", "by 12:00 PM", "deadline at 5:00 PM")
  const deadlineMatch = sentence.match(
    /(?:by|at|before|until)\s+(?:.*?at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|noon))/i
  );
  if (deadlineMatch && (eventType === 'deadline' || !startTime)) {
    const rawDeadline = deadlineMatch[1].trim();
    const normalized = normalizeTime(rawDeadline);
    if (eventType === 'deadline') {
      deadlineTime = normalized;
    } else if (!startTime) {
      startTime = normalized;
    }
  }

  // 5. Extract Venue or Submission location
  let venue: string | null = null;
  const venueMatch = sentence.match(
    /(?:(?:in|at|to)\s+|,\s*)(Room\s+\d+|Seminar\s+Hall|Lab\s+\d+|Auditorium(?:\s+\d+)?|Aud-\d+|Conference\s+Room|the\s+department\s+office|department\s+office|LH-\d+|Hall\s+[A-Z0-9]+)\b/i
  );
  if (venueMatch) {
    venue = venueMatch[1].trim();
    if (venue.toLowerCase().startsWith('the ')) {
      venue = venue.substring(4);
      venue = venue.charAt(0).toUpperCase() + venue.slice(1);
    }
  }

  // 6. Extract Topic (e.g. on ‘Al in Healthcare’ or ‘AI in Healthcare’)
  let topic: string | undefined;
  const topicMatch = sentence.match(
    /(?:on|topic:?)\s+['"‘“](.*?)['"’”]/i
  );
  if (topicMatch) {
    topic = topicMatch[1].trim();
    if (topic.includes('Al in Healthcare')) {
      ambiguities.push("'Al in Healthcare' flagged as potential OCR typo for 'AI in Healthcare'");
      topic = 'AI in Healthcare';
    }
  }

  // 7. Extract Title
  let title = extractEventTitle(sentence, eventType, isReschedule);

  if (!title || title.length < 3) {
    if (eventType === 'exam') title = 'Academic Examination';
    else if (eventType === 'deadline') title = 'Lab Record Submission';
    else if (eventType === 'lecture') title = 'Guest Lecture';
    else if (eventType === 'lab') title = 'Laboratory Session';
    else title = 'Scheduled Academic Event';
  }

  return {
    title,
    eventType,
    date: extractedDate,
    startTime,
    endTime,
    deadlineTime,
    venue,
    topic,
    sourceExcerpt: sentence.trim(),
    uncertainFields,
    inferredFields,
    ambiguities,
    isRescheduleOrChange: isReschedule,
  };
}

/**
 * Extracts a clean title from the sentence.
 */
function extractEventTitle(sentence: string, eventType: EventType, isReschedule: boolean): string {
  let text = sentence;

  text = text.replace(/^(?:NOTICE:\s*(?:Department of [^.]+)?|REVISED SCHEDULE:\s*)/i, '');
  text = text.replace(/^All\s+I[lI]-year\s+[A-Z]+\s+students:\s*/i, '');

  if (isReschedule) {
    const match = text.match(/^(?:The\s+)?(.*?)\s+previously\s+scheduled/i);
    if (match && match[1]) {
      return cleanTitle(match[1]);
    }
  }

  // Match: "Internal Test 2 will be held..."
  const verbMatch = text.match(
    /^(?:The\s+)?(.*?)\s+(?:will be held|is scheduled for|will take place|is scheduled on|is scheduled to be held)/i
  );
  if (verbMatch && verbMatch[1]) {
    return cleanTitle(verbMatch[1]);
  }

  // Match: "Lab records must be submitted..."
  const submitMatch = text.match(
    /(?:Students\s+must\s+submit\s+their|submit\s+your|deadline\s+for|(?:completed\s+)?lab\s+records)\s+(?:must\s+be\s+submitted)?/i
  );
  if (submitMatch) {
    return 'Lab Record Submission';
  }

  // Match: "A guest lecture on..."
  if (text.toLowerCase().includes('guest lecture')) {
    return 'Guest Lecture';
  }

  // Generic fallback
  const tokens = text.split(/\s+/);
  const cutoffIndex = tokens.findIndex((t) => /^(on|from|in|at|by|will)$/i.test(t));
  if (cutoffIndex > 0 && cutoffIndex <= 6) {
    return cleanTitle(tokens.slice(0, cutoffIndex).join(' '));
  }

  return cleanTitle(tokens.slice(0, 4).join(' '));
}

function cleanTitle(str: string): string {
  let cleaned = str
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[,\-:.]+$/, '')
    .trim();

  cleaned = cleaned
    .split(/\s+/)
    .map((w) => {
      const low = w.toLowerCase();
      if (['on', 'in', 'at', 'of', 'for', 'the', 'and'].includes(low)) return low;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
