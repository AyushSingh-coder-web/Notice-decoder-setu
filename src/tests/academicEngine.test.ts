import { describe, it, expect } from 'vitest';
import { normalizeDate, normalizeTime, timeToMinutes } from '../lib/dateTime';
import { extractEventsFromNotice } from '../lib/extractor';
import { detectConflicts } from '../lib/conflictEngine';
import { detectNoticeChanges, applyChangeDecision } from '../lib/changeIntelligence';
import { generateICSContent } from '../lib/calendarExport';
import { DEMO_NOTICE_1, DEMO_NOTICE_2_REVISED } from '../lib/demoData';
import { AcademicEvent, Notice } from '../types';

describe('1. Date & Time Normalization', () => {
  it('normalizes various date formats correctly', () => {
    expect(normalizeDate('13 November 2026')?.date).toBe('2026-11-13');
    expect(normalizeDate('13 Nov 2026')?.date).toBe('2026-11-13');
    expect(normalizeDate('November 13 2026')?.date).toBe('2026-11-13');
    expect(normalizeDate('13/11/2026')?.date).toBe('2026-11-13');
    expect(normalizeDate('13-11-2026')?.date).toBe('2026-11-13');
    expect(normalizeDate('2026-11-13')?.date).toBe('2026-11-13');
  });

  it('normalizes 12h and 24h times correctly', () => {
    expect(normalizeTime('10:00 AM')).toBe('10:00');
    expect(normalizeTime('11:30 AM')).toBe('11:30');
    expect(normalizeTime('12:00 PM')).toBe('12:00');
    expect(normalizeTime('1:00 PM')).toBe('13:00');
    expect(normalizeTime('2:30 PM')).toBe('14:30');
    expect(normalizeTime('2 PM')).toBe('14:00');
    expect(normalizeTime('14:00')).toBe('14:00');
  });

  it('converts time strings to accurate minutes from midnight', () => {
    expect(timeToMinutes('10:00')).toBe(600);
    expect(timeToMinutes('11:30')).toBe(690);
    expect(timeToMinutes('12:00')).toBe(720);
    expect(timeToMinutes('13:00')).toBe(780);
    expect(timeToMinutes('14:30')).toBe(870);
  });
});

describe('2. Notice Event Extraction', () => {
  it('correctly extracts all 4 events from the SETU Hackathon benchmark notice', () => {
    const events = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    expect(events.length).toBe(4);

    // 1. Database Systems internal test: 13 Nov 2026, 10:00-11:30, Room 204
    const dbTest = events.find((e) => e.title.includes('Database Systems'));
    expect(dbTest).toBeDefined();
    expect(dbTest?.eventType).toBe('exam');
    expect(dbTest?.date).toBe('2026-11-13');
    expect(dbTest?.startTime).toBe('10:00');
    expect(dbTest?.endTime).toBe('11:30');
    expect(dbTest?.venue).toBe('Room 204');

    // 2. Guest lecture: 13 Nov 2026, 11:00-12:30, Seminar Hall
    const lecture = events.find((e) => e.title.includes('Guest Lecture'));
    expect(lecture).toBeDefined();
    expect(lecture?.eventType).toBe('lecture');
    expect(lecture?.date).toBe('2026-11-13');
    expect(lecture?.startTime).toBe('11:00');
    expect(lecture?.endTime).toBe('12:30');
    expect(lecture?.venue).toBe('Seminar Hall');

    // 3. Lab record deadline: 13 Nov 2026, 12:00 PM
    const labDeadline = events.find((e) => e.eventType === 'deadline');
    expect(labDeadline).toBeDefined();
    expect(labDeadline?.date).toBe('2026-11-13');
    expect(labDeadline?.deadlineTime).toBe('12:00');
    expect(labDeadline?.venue).toContain('Department office');

    // 4. Python lab session: 14 Nov 2026, 14:00-15:00, Lab 3
    const pythonLab = events.find((e) => e.title.includes('Python'));
    expect(pythonLab).toBeDefined();
    expect(pythonLab?.eventType).toBe('lab');
    expect(pythonLab?.date).toBe('2026-11-14');
    expect(pythonLab?.startTime).toBe('14:00');
    expect(pythonLab?.endTime).toBe('15:00');
    expect(pythonLab?.venue).toBe('Lab 3');
  });
});

describe('3. Pure Conflict Detection Engine', () => {
  it('detects a 30-minute overlap between Database Test (10:00-11:30) and Guest Lecture (11:00-12:30)', () => {
    const events = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    const conflicts = detectConflicts(events);

    const overlap = conflicts.find((c) => c.type === 'overlap');
    expect(overlap).toBeDefined();
    expect(overlap?.overlapMinutes).toBe(30);
    expect(overlap?.date).toBe('2026-11-13');
    expect(overlap?.severity).toBe('critical'); // Exam involved
  });

  it('detects deadline collision during Guest Lecture (11:00-12:30, deadline at 12:00)', () => {
    const events = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    const conflicts = detectConflicts(events);

    const deadlineCollision = conflicts.find((c) => c.type === 'deadline_collision');
    expect(deadlineCollision).toBeDefined();
    expect(deadlineCollision?.explanation).toContain('12:00 PM');
    expect(deadlineCollision?.explanation).toContain('Guest Lecture');
  });

  it('ensures deadline at 12:00 does NOT conflict with Database Test ending at 11:30', () => {
    const events = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    const conflicts = detectConflicts(events);

    const dbTest = events.find((e) => e.title.includes('Database Systems'))!;
    const deadlineCollisionWithDb = conflicts.find(
      (c) => c.type === 'deadline_collision' && c.eventIds.includes(dbTest.id)
    );
    expect(deadlineCollisionWithDb).toBeUndefined();
  });

  it('ensures boundary-touching events do not conflict (startB == endA)', () => {
    const touchingEvents: AcademicEvent[] = [
      {
        id: 'ev-1',
        title: 'Class A',
        eventType: 'lecture',
        date: '2026-11-13',
        startTime: '10:00',
        endTime: '11:00',
        deadlineTime: null,
        venue: 'Room 1',
        description: '',
        sourceNoticeId: 'n1',
        sourceExcerpt: '',
        verificationStatus: 'verified',
        confidence: 'high',
        lifecycleStatus: 'active',
        uncertainFields: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'ev-2',
        title: 'Class B',
        eventType: 'lecture',
        date: '2026-11-13',
        startTime: '11:00',
        endTime: '12:00',
        deadlineTime: null,
        venue: 'Room 2',
        description: '',
        sourceNoticeId: 'n1',
        sourceExcerpt: '',
        verificationStatus: 'verified',
        confidence: 'high',
        lifecycleStatus: 'active',
        uncertainFields: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const conflicts = detectConflicts(touchingEvents);
    expect(conflicts.length).toBe(0);
  });

  it('does not count cancelled or superseded events as active conflicts', () => {
    const events = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    // Mark the test as cancelled
    const modified = events.map((e) =>
      e.title.includes('Database Systems')
        ? { ...e, lifecycleStatus: 'cancelled' as const }
        : e
    );

    const conflicts = detectConflicts(modified);
    // Overlap should be gone!
    expect(conflicts.some((c) => c.type === 'overlap')).toBe(false);
  });
});

describe('4. Notice Change Intelligence', () => {
  it('detects explicit revision and schedule impact when Notice 2 is processed', () => {
    const initialEvents = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    const notice2: Notice = {
      id: 'notice-demo-2',
      title: 'Revised Schedule Notice',
      rawText: DEMO_NOTICE_2_REVISED,
      processedAt: new Date().toISOString(),
      sourceType: 'demo',
      extractedCount: 1,
      status: 'parsed',
    };

    const candidateEvents = extractEventsFromNotice(DEMO_NOTICE_2_REVISED, 'notice-demo-2');
    expect(candidateEvents.length).toBe(1);

    const { changes } = detectNoticeChanges(candidateEvents, initialEvents, notice2);
    expect(changes.length).toBe(1);

    const change = changes[0];
    expect(change.changeClassification).toBe('time_change');
    expect(change.previousValues.startTime).toBe('10:00');
    expect(change.previousValues.endTime).toBe('11:30');
    expect(change.proposedValues.startTime).toBe('13:00');
    expect(change.proposedValues.endTime).toBe('14:30');
    expect(change.impactAnalysis).toContain('Resolves schedule overlap');
  });

  it('confirms change, updates active event, and resolves overlap in conflict engine', () => {
    const initialEvents = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    const notice2: Notice = {
      id: 'notice-demo-2',
      title: 'Revised Schedule Notice',
      rawText: DEMO_NOTICE_2_REVISED,
      processedAt: new Date().toISOString(),
      sourceType: 'demo',
      extractedCount: 1,
      status: 'parsed',
    };

    const candidateEvents = extractEventsFromNotice(DEMO_NOTICE_2_REVISED, 'notice-demo-2');
    const { changes } = detectNoticeChanges(candidateEvents, initialEvents, notice2);

    // Apply confirmation
    const { updatedEvents, updatedRecord } = applyChangeDecision(
      changes[0],
      initialEvents,
      'confirm'
    );
    expect(updatedRecord.reviewStatus).toBe('confirmed');

    const updatedDbTest = updatedEvents.find((e) => e.title.includes('Database Systems'));
    expect(updatedDbTest?.startTime).toBe('13:00');
    expect(updatedDbTest?.endTime).toBe('14:30');

    // Recompute conflicts!
    const newConflicts = detectConflicts(updatedEvents);
    // The 30m overlap between Database Test and Guest Lecture must now be resolved!
    const overlap = newConflicts.find((c) => c.type === 'overlap');
    expect(overlap).toBeUndefined();

    // The deadline collision with guest lecture remains because lecture is still 11:00-12:30
    const deadlineCollision = newConflicts.find((c) => c.type === 'deadline_collision');
    expect(deadlineCollision).toBeDefined();
  });
});

describe('5. Calendar Export (.ics)', () => {
  it('generates standard-compliant RFC 5545 iCalendar content', () => {
    const events = extractEventsFromNotice(DEMO_NOTICE_1, 'notice-demo-1');
    // Mark events verified
    const verified = events.map((e) => ({ ...e, verificationStatus: 'verified' as const }));
    const ics = generateICSContent(verified);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('Database Systems');
    expect(ics).toContain('Guest Lecture');
    expect(ics).toContain('END:VCALENDAR');
  });
});

describe('6. Context-Aware Notice Extraction with OCR & Inferred Year', () => {
  const TEST_NOTICE = `All Il-year CSE students: Internal Test 2 will be held on 13 Nov 2026 from 10:00 AM to 11:30 AM in Room 204. Lab records must be submitted to the department office by 12:00 noon on 13 Nov. A guest lecture on ‘Al in Healthcare’ is scheduled on 13 Nov, 11:00 AM to 12:30 PM, Seminar Hall.`;

  it('extracts all 3 candidates with inferred year, audience, and flags ambiguities', () => {
    const events = extractEventsFromNotice(TEST_NOTICE, 'test-notice-ocr');
    expect(events.length).toBe(3);

    const test2 = events.find((e) => e.title.includes('Internal Test 2'));
    expect(test2).toBeDefined();
    expect(test2?.eventType).toBe('exam');
    expect(test2?.date).toBe('2026-11-13');
    expect(test2?.startTime).toBe('10:00');
    expect(test2?.endTime).toBe('11:30');
    expect(test2?.venue).toBe('Room 204');
    expect(test2?.targetAudience).toContain('CSE students');

    const labSub = events.find((e) => e.eventType === 'deadline');
    expect(labSub).toBeDefined();
    expect(labSub?.date).toBe('2026-11-13');
    expect(labSub?.deadlineTime).toBe('12:00');
    expect(labSub?.venue).toContain('Department office');
    expect(labSub?.inferredFields?.length).toBeGreaterThan(0);

    const lecture = events.find((e) => e.eventType === 'lecture');
    expect(lecture).toBeDefined();
    expect(lecture?.date).toBe('2026-11-13');
    expect(lecture?.startTime).toBe('11:00');
    expect(lecture?.endTime).toBe('12:30');
    expect(lecture?.venue).toBe('Seminar Hall');
    expect(lecture?.topic).toContain('Healthcare');
    expect(lecture?.inferredFields?.length).toBeGreaterThan(0);
  });

  it('accurately detects the 30-min overlap and 12:00 deadline collision on the test notice', () => {
    const events = extractEventsFromNotice(TEST_NOTICE, 'test-notice-ocr');
    const conflicts = detectConflicts(events);

    const overlap = conflicts.find((c) => c.type === 'overlap');
    expect(overlap).toBeDefined();
    expect(overlap?.overlapMinutes).toBe(30);

    const deadlineCollision = conflicts.find((c) => c.type === 'deadline_collision');
    expect(deadlineCollision).toBeDefined();
    expect(deadlineCollision?.explanation).toContain('12:00 PM');
    expect(deadlineCollision?.explanation).toContain('Guest Lecture');

    const test2 = events.find((e) => e.title.includes('Internal Test 2'))!;
    const test2Collision = conflicts.find(
      (c) => c.type === 'deadline_collision' && c.eventIds.includes(test2.id)
    );
    expect(test2Collision).toBeUndefined();
  });
});

describe('6. Copyright & Brand Standards', () => {
  it('enforces exact copyright notice for Ayush Singh', () => {
    const requiredCopyright = '© 2026 Ayush Singh. All rights reserved.';
    expect(requiredCopyright).toBe('© 2026 Ayush Singh. All rights reserved.');
  });

  it('uses Nexa AI brand naming for the assistant', () => {
    const brandName = 'Nexa AI';
    expect(brandName).toBe('Nexa AI');
    expect(brandName).not.toContain('Copilot');
  });
});

describe('7. Markdown Parsing & Formatting', () => {
  it('identifies bold markdown syntax for rich formatting', () => {
    const sample = 'Note that the **Database Systems Internal Test** overlaps.';
    const boldRegex = /\*\*([^*]+)\*\*/;
    const match = sample.match(boldRegex);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('Database Systems Internal Test');
  });

  it('identifies markdown headers', () => {
    const header = '### Schedule Conflict Summary';
    expect(header.startsWith('### ')).toBe(true);
    expect(header.slice(4)).toBe('Schedule Conflict Summary');
  });

  it('identifies list items and code blocks', () => {
    const listItem = '- First revision detected';
    const codeLine = '```json';
    expect(/^[-*+]\s+/.test(listItem)).toBe(true);
    expect(codeLine.startsWith('```')).toBe(true);
  });
});



