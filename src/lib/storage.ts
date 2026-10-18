import { AcademicEvent, AssistantMessage, ChangeRecord, Conflict, Notice } from '../types';

const STORAGE_KEYS = {
  NOTICES: 'noticedecoder_notices_v1',
  EVENTS: 'noticedecoder_events_v1',
  CHANGES: 'noticedecoder_changes_v1',
  MESSAGES: 'noticedecoder_messages_v1',
  THEME: 'noticedecoder_theme_v1',
};

export interface AppState {
  notices: Notice[];
  events: AcademicEvent[];
  changes: ChangeRecord[];
  messages: AssistantMessage[];
  theme: 'dark' | 'light';
}

export function loadStoredState(): Partial<AppState> {
  if (typeof window === 'undefined') return {};
  try {
    const rawNotices = localStorage.getItem(STORAGE_KEYS.NOTICES);
    const rawEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const rawChanges = localStorage.getItem(STORAGE_KEYS.CHANGES);
    const rawMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const rawTheme = localStorage.getItem(STORAGE_KEYS.THEME);

    return {
      notices: rawNotices ? JSON.parse(rawNotices) : undefined,
      events: rawEvents ? JSON.parse(rawEvents) : undefined,
      changes: rawChanges ? JSON.parse(rawChanges) : undefined,
      messages: rawMessages ? JSON.parse(rawMessages) : undefined,
      theme: rawTheme === 'light' ? 'light' : 'dark',
    };
  } catch (err) {
    console.error('Error loading stored Notice Decoder state:', err);
    return {};
  }
}

export function saveStoredState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return;
  try {
    if (state.notices !== undefined) {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(state.notices));
    }
    if (state.events !== undefined) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(state.events));
    }
    if (state.changes !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CHANGES, JSON.stringify(state.changes));
    }
    if (state.messages !== undefined) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(state.messages));
    }
    if (state.theme !== undefined) {
      localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    }
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function clearAllStoredData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.NOTICES);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  localStorage.removeItem(STORAGE_KEYS.CHANGES);
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
}
