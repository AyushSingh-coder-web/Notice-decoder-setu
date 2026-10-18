import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  FileText,
  Search,
} from 'lucide-react';
import { AcademicEvent, Conflict, EventType } from '../../types';
import { formatDisplayDate, formatDisplayTime } from '../../lib/dateTime';
import { generateICSContent, downloadICSFile } from '../../lib/calendarExport';

interface CalendarTabProps {
  events: AcademicEvent[];
  conflicts: Conflict[];
  onOpenEditModal: (event: AcademicEvent) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  events,
  conflicts,
  onOpenEditModal,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const activeEvents = events.filter((e) => e.lifecycleStatus === 'active');

  const filteredEvents = activeEvents.filter((ev) => {
    if (selectedType !== 'all' && ev.eventType !== selectedType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(term);
      const matchVenue = ev.venue?.toLowerCase().includes(term);
      const matchDate = ev.date.includes(term);
      if (!matchTitle && !matchVenue && !matchDate) return false;
    }
    return true;
  });

  // Sort chronologically by date and start time
  filteredEvents.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const timeA = a.startTime || a.deadlineTime || '00:00';
    const timeB = b.startTime || b.deadlineTime || '00:00';
    return timeA.localeCompare(timeB);
  });

  const handleExportAll = () => {
    const verifiedEvents = activeEvents.filter((e) => e.verificationStatus === 'verified');
    const toExport = verifiedEvents.length > 0 ? verifiedEvents : activeEvents;

    const icsString = generateICSContent(toExport);
    const success = downloadICSFile('Notice_Decoder_Academic_Schedule.ics', icsString);
    if (success) {
      setExportSuccess(`Exported ${toExport.length} verified events to Notice_Decoder_Academic_Schedule.ics`);
      setTimeout(() => setExportSuccess(null), 4000);
    }
  };

  const handleExportSingle = (event: AcademicEvent) => {
    const icsString = generateICSContent([event]);
    const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    const success = downloadICSFile(filename, icsString);
    if (success) {
      setExportSuccess(`Exported "${event.title}" to ${filename}`);
      setTimeout(() => setExportSuccess(null), 4000);
    }
  };

  const eventTypes: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'exam', label: 'Exams' },
    { id: 'lecture', label: 'Lectures' },
    { id: 'deadline', label: 'Deadlines' },
    { id: 'lab', label: 'Labs' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with Filter & Export actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252936] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA]">Academic Calendar & Agenda</h2>
          <p className="text-xs text-[#A6ACB8]">
            Standards-compliant academic schedule with direct iCalendar (.ics) export.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportAll}
            disabled={activeEvents.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg shadow-lg shadow-violet-900/30 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Verified Schedule (.ics)</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Filter Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A6ACB8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events, venues, dates..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0F1115] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] placeholder-[#A6ACB8]/60 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0F1115] border border-[#252936] rounded-lg overflow-x-auto">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedType === type.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[#A6ACB8] hover:text-[#F5F7FA]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Feed */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-2">
          <Calendar className="w-8 h-8 text-[#A6ACB8] mx-auto" />
          <h4 className="text-xs font-semibold text-[#F5F7FA]">No Events Found</h4>
          <p className="text-xs text-[#A6ACB8] max-w-xs mx-auto">
            No academic sessions match the current search or category filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const hasConflict = conflicts.some(
              (c) => !c.dismissed && c.eventIds.includes(event.id)
            );
            const isDeadline = event.eventType === 'deadline' || Boolean(event.deadlineTime);

            return (
              <div
                key={event.id}
                className={`p-4 rounded-xl border transition-all ${
                  hasConflict
                    ? 'bg-[#151820] border-amber-500/40'
                    : 'bg-[#0F1115] border-[#252936] hover:border-violet-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-violet-400">
                        {event.eventType}
                      </span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <h3 className="text-sm font-bold text-[#F5F7FA]">{event.title}</h3>

                      {hasConflict && (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 ml-2">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Active Overlap</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A6ACB8]">
                      <div className="flex items-center gap-1 text-[#F5F7FA]">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                        <span>{formatDisplayDate(event.date)}</span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[#F5F7FA]">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {isDeadline
                            ? `Cutoff: ${formatDisplayTime(event.deadlineTime || event.startTime)}`
                            : `${formatDisplayTime(event.startTime)} – ${formatDisplayTime(event.endTime)}`}
                        </span>
                      </div>

                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#A6ACB8]" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-[#A6ACB8] italic pt-1">
                      Source: "{event.sourceExcerpt}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => onOpenEditModal(event)}
                      className="p-1.5 text-[#A6ACB8] hover:text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] rounded-lg transition-colors"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExportSingle(event)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A6ACB8] hover:text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] rounded-lg transition-colors whitespace-nowrap"
                      title="Download single .ics file"
                    >
                      <Download className="w-3 h-3" />
                      <span>.ics</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
