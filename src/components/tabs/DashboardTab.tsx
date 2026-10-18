import React from 'react';
import {
  Calendar,
  AlertTriangle,
  GitCompare,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Play,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { AcademicEvent, ChangeRecord, Conflict, ImpactRadarItem, Notice } from '../../types';
import { formatDisplayDate, formatDisplayTime } from '../../lib/dateTime';

interface DashboardTabProps {
  events: AcademicEvent[];
  conflicts: Conflict[];
  changes: ChangeRecord[];
  notices: Notice[];
  radarItems: ImpactRadarItem[];
  onNavigateTab: (tab: string) => void;
  onOpenChangeReview: (change: ChangeRecord) => void;
  onOpenEventEdit: (event: AcademicEvent) => void;
  onLoadDemoNotice1: () => void;
  onLoadDemoNotice2: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  events,
  conflicts,
  changes,
  notices,
  radarItems,
  onNavigateTab,
  onOpenChangeReview,
  onOpenEventEdit,
  onLoadDemoNotice1,
  onLoadDemoNotice2,
}) => {
  const activeEvents = events.filter((e) => e.lifecycleStatus === 'active');
  const pendingChanges = changes.filter((c) => c.reviewStatus === 'pending');
  const activeConflicts = conflicts.filter((c) => !c.dismissed);
  const deadlines = activeEvents.filter((e) => e.eventType === 'deadline' || e.deadlineTime);

  return (
    <div className="space-y-6">
      {/* Hackathon Benchmark Fast-Action Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-violet-950/40 via-[#151820] to-[#0F1115] border border-violet-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              Hackathon Evaluation Mode
            </span>
            <span className="text-[11px] text-[#A6ACB8]">· SETU 2026 PS-02 Benchmark</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#F5F7FA]">
            {notices.length === 0
              ? 'Ready to demonstrate Academic Change Intelligence'
              : pendingChanges.length > 0
              ? 'Notice revision detected — awaiting your confirmation'
              : 'Benchmark schedule verified and active'}
          </h2>
          <p className="text-xs text-[#A6ACB8] max-w-2xl leading-relaxed">
            {notices.length === 0
              ? 'Click below to decode the official benchmark announcement containing overlapping sessions and an active deadline collision.'
              : pendingChanges.length > 0
              ? 'Notice 2 proposed rescheduling the Database Systems exam to 1:00 PM – 2:30 PM. Review the impact analysis to see how it resolves the conflict.'
              : 'All notices reconciled. Overlaps resolved. Ready to export standards-compliant calendar files.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          {notices.length === 0 ? (
            <button
              onClick={onLoadDemoNotice1}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-lg shadow-violet-900/30 transition-all whitespace-nowrap min-h-[40px] w-full sm:w-auto justify-center"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Load Benchmark (Step 1)</span>
            </button>
          ) : pendingChanges.length > 0 ? (
            <button
              onClick={() => onOpenChangeReview(pendingChanges[0])}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-900/30 transition-all whitespace-nowrap min-h-[40px] w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review Notice Revision</span>
            </button>
          ) : (
            <button
              onClick={onLoadDemoNotice2}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-300 bg-[#151820] hover:bg-[#1f2432] border border-violet-500/40 rounded-lg transition-all whitespace-nowrap min-h-[40px] w-full sm:w-auto justify-center"
            >
              <GitCompare className="w-4 h-4" />
              <span>Load Revision Notice (Step 2)</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards (Tabular Discipline) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Events */}
        <div className="p-4 rounded-xl bg-[#0F1115] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#A6ACB8] text-xs">
            <span>Active Events</span>
            <Calendar className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-[#F5F7FA]">
              {activeEvents.length}
            </span>
            <span className="text-[11px] text-[#A6ACB8]">scheduled</span>
          </div>
        </div>

        {/* Schedule Conflicts */}
        <div className="p-4 rounded-xl bg-[#0F1115] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#A6ACB8] text-xs">
            <span>Schedule Conflicts</span>
            <AlertTriangle className={`w-4 h-4 ${activeConflicts.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${activeConflicts.length > 0 ? 'text-amber-400' : 'text-[#F5F7FA]'}`}>
              {activeConflicts.length}
            </span>
            <span className="text-[11px] text-[#A6ACB8]">
              {activeConflicts.length > 0 ? 'collisions' : 'clear'}
            </span>
          </div>
        </div>

        {/* Pending Revisions */}
        <div className="p-4 rounded-xl bg-[#0F1115] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#A6ACB8] text-xs">
            <span>Notice Revisions</span>
            <GitCompare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${pendingChanges.length > 0 ? 'text-cyan-400' : 'text-[#F5F7FA]'}`}>
              {pendingChanges.length}
            </span>
            <span className="text-[11px] text-[#A6ACB8]">pending review</span>
          </div>
        </div>

        {/* Deadlines */}
        <div className="p-4 rounded-xl bg-[#0F1115] border border-[#252936] space-y-2">
          <div className="flex items-center justify-between text-[#A6ACB8] text-xs">
            <span>Upcoming Deadlines</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-[#F5F7FA]">
              {deadlines.length}
            </span>
            <span className="text-[11px] text-[#A6ACB8]">cutoffs</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Impact Radar (Left) + Active Schedule (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Academic Impact Radar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Academic Impact Radar</h3>
              <p className="text-xs text-[#A6ACB8]">
                Real-time consequences of notice schedules & active collisions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('intelligence')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
            >
              <span>Detailed Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {radarItems.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-semibold text-[#F5F7FA]">Schedule Status Clear</h4>
              <p className="text-xs text-[#A6ACB8] max-w-sm mx-auto">
                No active conflicts, unreviewed revisions, or unverified notice data detected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {radarItems.slice(0, 4).map((item) => {
                const isCritical = item.severity === 'critical';
                const isHigh = item.severity === 'high';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                        : isHigh
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-[#0F1115] border-[#252936] text-[#A6ACB8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase ${
                              isCritical
                                ? 'text-rose-400'
                                : isHigh
                                ? 'text-amber-400'
                                : 'text-cyan-400'
                            }`}
                          >
                            {item.severity}
                          </span>
                          <span aria-hidden="true" className="text-neutral-600">·</span>
                          <h4 className="text-xs font-bold text-[#F5F7FA]">{item.title}</h4>
                        </div>
                        <p className="text-xs leading-relaxed text-[#F5F7FA]/90">
                          {item.description}
                        </p>
                        <p className="text-[11px] text-[#A6ACB8] pt-1">
                          <span className="font-semibold text-violet-400">Action:</span> {item.actionRecommendation}
                        </p>
                      </div>

                      {item.category === 'revision' && pendingChanges.length > 0 && (
                        <button
                          onClick={() => onOpenChangeReview(pendingChanges[0])}
                          className="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Review Change
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Schedule Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Active Academic Events</h3>
              <p className="text-xs text-[#A6ACB8]">Extracted from verified notices</p>
            </div>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
            >
              <span>View Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeEvents.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-3">
              <FileText className="w-8 h-8 text-[#A6ACB8] mx-auto" />
              <p className="text-xs text-[#A6ACB8]">
                No academic events have been decoded yet.
              </p>
              <button
                onClick={() => onNavigateTab('decode')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
              >
                Decode a Notice
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeEvents.map((event) => {
                const isConflictInvolved = activeConflicts.some((c) =>
                  c.eventIds.includes(event.id)
                );

                return (
                  <div
                    key={event.id}
                    onClick={() => onOpenEventEdit(event)}
                    className="p-3.5 rounded-xl bg-[#0F1115] hover:bg-[#151820] border border-[#252936] cursor-pointer transition-colors space-y-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                          {event.eventType}
                        </span>
                        <h4 className="text-xs font-bold text-[#F5F7FA] group-hover:text-violet-300 transition-colors">
                          {event.title}
                        </h4>
                      </div>

                      {isConflictInvolved && (
                        <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overlap</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#A6ACB8] pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDisplayDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>
                          {event.startTime
                            ? `${formatDisplayTime(event.startTime)} – ${formatDisplayTime(event.endTime)}`
                            : `Cutoff: ${formatDisplayTime(event.deadlineTime)}`}
                        </span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
