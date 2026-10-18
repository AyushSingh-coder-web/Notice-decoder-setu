import React, { useState } from 'react';
import { X, Check, Calendar, Clock, MapPin, Tag, AlertCircle } from 'lucide-react';
import { AcademicEvent, EventType, VerificationStatus } from '../types';

interface EventEditModalProps {
  event: AcademicEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: AcademicEvent) => void;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !event) return null;

  const [title, setTitle] = useState(event.title);
  const [eventType, setEventType] = useState<EventType>(event.eventType);
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState(event.startTime || '');
  const [endTime, setEndTime] = useState(event.endTime || '');
  const [deadlineTime, setDeadlineTime] = useState(event.deadlineTime || '');
  const [venue, setVenue] = useState(event.venue || '');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...event,
      title: title.trim(),
      eventType,
      date,
      startTime: startTime ? startTime : null,
      endTime: endTime ? endTime : null,
      deadlineTime: deadlineTime ? deadlineTime : null,
      venue: venue.trim() ? venue.trim() : null,
      verificationStatus,
      uncertainFields: [], // Cleared once user manually verifies
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F1115] border border-[#252936] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252936] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#F5F7FA]">Edit & Verify Academic Event</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A6ACB8] hover:text-[#F5F7FA] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Source Quote */}
          <div className="p-3 bg-[#151820] border border-[#252936] rounded-lg text-xs space-y-1">
            <span className="text-[#A6ACB8] font-medium">Notice Source Evidence:</span>
            <p className="text-[#F5F7FA] italic">"{event.sourceExcerpt}"</p>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#A6ACB8]">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Event Type & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A6ACB8]">Category</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500"
              >
                <option value="exam">Exam / Test</option>
                <option value="lecture">Lecture / Seminar</option>
                <option value="deadline">Submission Deadline</option>
                <option value="lab">Lab Session</option>
                <option value="assignment">Assignment</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A6ACB8]">Calendar Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>

          {/* Times */}
          {eventType === 'deadline' ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A6ACB8]">Submission Cutoff Time</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A6ACB8]">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A6ACB8]">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Venue */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#A6ACB8]">Venue / Location</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Room 204, Seminar Hall, Lab 3"
              className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Verification Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#A6ACB8]">Verification Status</label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
              className="w-full px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] focus:outline-none focus:border-violet-500"
            >
              <option value="verified">Verified (Ready for Calendar Export)</option>
              <option value="unverified">Unverified (Requires Further Confirmation)</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A6ACB8] hover:text-[#F5F7FA] bg-[#151820] border border-[#252936] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Save Verified Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
