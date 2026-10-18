export type EventType =
  | 'exam'
  | 'lecture'
  | 'deadline'
  | 'lab'
  | 'assignment'
  | 'meeting'
  | 'workshop'
  | 'other';

export type VerificationStatus = 'verified' | 'unverified' | 'incomplete';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type LifecycleStatus = 'active' | 'superseded' | 'cancelled' | 'needs_review';

export interface Notice {
  id: string;
  title: string;
  rawText: string;
  processedAt: string; // ISO string
  sourceType: 'paste' | 'file' | 'demo';
  extractedCount: number;
  status: 'parsed' | 'review_required' | 'archived';
  fileName?: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  eventType: EventType;
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:mm 24hr format
  endTime: string | null; // HH:mm 24hr format
  deadlineTime: string | null; // HH:mm 24hr format
  venue: string | null;
  description: string;
  sourceNoticeId: string;
  sourceExcerpt: string;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
  lifecycleStatus: LifecycleStatus;
  supersededByEventId?: string;
  uncertainFields: string[]; // e.g. ['venue', 'time', 'date']
  inferredFields?: string[]; // e.g. ['year inferred from notice context']
  ambiguities?: string[]; // e.g. ["'Il-year' flagged as potential OCR typo for 'II-year'", "'Al in Healthcare' flagged as potential OCR typo for 'AI in Healthcare'"]
  topic?: string;
  targetAudience?: string;
  extractionSource?: 'ai' | 'deterministic';
  createdAt: string;
  updatedAt: string;
}

export type ChangeClassification =
  | 'rescheduled'
  | 'time_change'
  | 'venue_change'
  | 'cancelled'
  | 'deadline_change'
  | 'duplicate'
  | 'new_event'
  | 'ambiguous';

export interface ChangeRecord {
  id: string;
  targetEventId: string;
  targetEventTitle: string;
  sourceNoticeId: string;
  sourceNoticeTitle: string;
  previousValues: {
    date?: string;
    startTime?: string | null;
    endTime?: string | null;
    deadlineTime?: string | null;
    venue?: string | null;
    lifecycleStatus?: LifecycleStatus;
  };
  proposedValues: {
    date?: string;
    startTime?: string | null;
    endTime?: string | null;
    deadlineTime?: string | null;
    venue?: string | null;
    lifecycleStatus?: LifecycleStatus;
  };
  changeClassification: ChangeClassification;
  supportingEvidence: string;
  impactAnalysis: string;
  reviewStatus: 'pending' | 'confirmed' | 'rejected';
  confidence: ConfidenceLevel;
  detectedAt: string;
  confirmedAt?: string;
}

export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'informational';
export type ConflictType = 'overlap' | 'deadline_collision' | 'venue_clash';

export interface Conflict {
  id: string;
  type: ConflictType;
  eventIds: string[];
  eventTitles: string[];
  date: string;
  overlapMinutes?: number;
  severity: ConflictSeverity;
  explanation: string;
  sourceEvidence: string[];
  dismissed?: boolean;
}

export interface ImpactRadarItem {
  id: string;
  severity: ConflictSeverity;
  title: string;
  description: string;
  affectedEventIds: string[];
  sourceNoticeId?: string;
  actionRecommendation: string;
  category: 'conflict' | 'revision' | 'deadline_cluster' | 'verification_needed';
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: {
    noticeId?: string;
    noticeTitle?: string;
    excerpt?: string;
    eventId?: string;
    eventTitle?: string;
  }[];
  isLocalFallback?: boolean;
}

export interface CalendarFilterState {
  search: string;
  eventTypes: EventType[];
  statusFilter: 'all' | 'verified_only' | 'needs_attention';
  dateRange: 'all' | 'today' | 'this_week' | 'this_month';
}
