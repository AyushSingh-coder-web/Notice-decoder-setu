import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { AcademicEvent, ChangeRecord, Conflict, ImpactRadarItem } from '../../types';
import { formatDisplayDate, formatDisplayTime } from '../../lib/dateTime';

interface IntelligenceTabProps {
  changes: ChangeRecord[];
  conflicts: Conflict[];
  radarItems: ImpactRadarItem[];
  events: AcademicEvent[];
  onConfirmChange: (change: ChangeRecord) => void;
  onRejectChange: (change: ChangeRecord) => void;
  onOpenChangeModal: (change: ChangeRecord) => void;
  onDismissConflict: (conflictId: string) => void;
}

export const IntelligenceTab: React.FC<IntelligenceTabProps> = ({
  changes,
  conflicts,
  radarItems,
  events,
  onConfirmChange,
  onRejectChange,
  onOpenChangeModal,
  onDismissConflict,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'changes' | 'radar'>('changes');

  const pendingChanges = changes.filter((c) => c.reviewStatus === 'pending');
  const pastChanges = changes.filter((c) => c.reviewStatus !== 'pending');

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Sub-heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252936] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA]">Academic Intelligence Engine</h2>
          <p className="text-xs text-[#A6ACB8]">
            Notice-to-notice change detection, schedule conflict arithmetic, and impact radar.
          </p>
        </div>

        {/* Segmented controls (Buttons with active styles) */}
        <div className="flex items-center gap-1 p-1 bg-[#151820] border border-[#252936] rounded-lg shrink-0">
          <button
            onClick={() => setActiveSubTab('changes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'changes'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[#A6ACB8] hover:text-[#F5F7FA]'
            }`}
          >
            <span>Notice Revisions</span>
            {pendingChanges.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-cyan-400 text-neutral-900 font-mono text-[10px] font-bold">
                {pendingChanges.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('radar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'radar'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[#A6ACB8] hover:text-[#F5F7FA]'
            }`}
          >
            <span>Impact Radar</span>
            {conflicts.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-neutral-900 font-mono text-[10px] font-bold">
                {conflicts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subtab 1: Notice Revisions (Change Intelligence) */}
      {activeSubTab === 'changes' && (
        <div className="space-y-6">
          {/* Pending Changes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Pending Notice Revisions ({pendingChanges.length})</span>
              </h3>
              <span className="text-xs text-[#A6ACB8]">
                Changes detected between incoming announcements and stored events
              </span>
            </div>

            {pendingChanges.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-semibold text-[#F5F7FA]">No Pending Revisions</h4>
                <p className="text-xs text-[#A6ACB8] max-w-sm mx-auto">
                  All active events match their current notices. When a revised circular is posted, change comparisons appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingChanges.map((change) => (
                  <div
                    key={change.id}
                    className="p-5 rounded-xl bg-[#0F1115] border border-cyan-500/30 shadow-lg space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252936] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                            {change.changeClassification}
                          </span>
                          <span aria-hidden="true" className="text-neutral-600">·</span>
                          <h4 className="text-sm font-bold text-[#F5F7FA]">
                            {change.targetEventTitle}
                          </h4>
                        </div>
                        <p className="text-xs text-[#A6ACB8]">
                          Source Circular: {change.sourceNoticeTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRejectChange(change)}
                          className="px-3 py-1.5 text-xs font-medium text-[#A6ACB8] hover:text-red-400 bg-[#151820] hover:bg-red-950/20 border border-[#252936] hover:border-red-500/30 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Keep Existing
                        </button>
                        <button
                          onClick={() => onConfirmChange(change)}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-900/30 transition-colors whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Revision</span>
                        </button>
                      </div>
                    </div>

                    {/* Side-by-side values */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Previous Schedule */}
                      <div className="p-3.5 rounded-lg bg-[#151820] border border-[#252936] space-y-2 text-xs">
                        <span className="text-[10px] font-semibold text-[#A6ACB8] uppercase tracking-wider block">
                          Original Schedule
                        </span>
                        <div className="flex items-center gap-2 text-[#F5F7FA]">
                          <Calendar className="w-3.5 h-3.5 text-[#A6ACB8]" />
                          <span>{change.previousValues.date ? formatDisplayDate(change.previousValues.date) : 'Unchanged'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#F5F7FA] font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#A6ACB8]" />
                          <span>
                            {change.previousValues.startTime
                              ? `${formatDisplayTime(change.previousValues.startTime)} – ${formatDisplayTime(change.previousValues.endTime || null)}`
                              : 'No time specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#F5F7FA]">
                          <MapPin className="w-3.5 h-3.5 text-[#A6ACB8]" />
                          <span>{change.previousValues.venue || 'Campus'}</span>
                        </div>
                      </div>

                      {/* Proposed Revision */}
                      <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
                        <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
                          Revised Announcement Values
                        </span>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{change.proposedValues.date ? formatDisplayDate(change.proposedValues.date) : 'Same Date'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-mono font-bold">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            {change.proposedValues.startTime
                              ? `${formatDisplayTime(change.proposedValues.startTime)} – ${formatDisplayTime(change.proposedValues.endTime || null)}`
                              : 'No time specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{change.proposedValues.venue || change.previousValues.venue || 'Campus'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Evidence & Impact */}
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#08090B] border border-[#252936] text-[#A6ACB8]">
                        <span className="font-semibold text-cyan-400">Notice Excerpt:</span>{' '}
                        <span className="italic text-[#F5F7FA]">"{change.supportingEvidence}"</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                        <span className="font-semibold text-emerald-400">Schedule Impact:</span>{' '}
                        {change.impactAnalysis}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision Decision History */}
          {pastChanges.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#252936]">
              <h3 className="text-sm font-bold text-[#F5F7FA]">
                Change Decision Log ({pastChanges.length})
              </h3>
              <div className="space-y-2">
                {pastChanges.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-lg bg-[#0F1115] border border-[#252936] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#F5F7FA]">{ch.targetEventTitle}</span>
                      <span className="text-[#A6ACB8] ml-2">
                        {ch.previousValues.startTime} → {ch.proposedValues.startTime}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        ch.reviewStatus === 'confirmed' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ch.reviewStatus.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Academic Impact Radar */}
      {activeSubTab === 'radar' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Active Academic Impact Radar</h3>
              <p className="text-xs text-[#A6ACB8]">
                Deterministic mathematical detection of time conflicts, deadline collisions, and convergence.
              </p>
            </div>
          </div>

          {radarItems.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-semibold text-[#F5F7FA]">Zero Conflicts Detected</h4>
              <p className="text-xs text-[#A6ACB8] max-w-sm mx-auto">
                No active schedule overlaps or deadline collisions. All session intervals satisfy <code className="text-violet-400">startA &gt;= endB || startB &gt;= endA</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {radarItems.map((item) => {
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
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
                      </div>

                      <p className="text-xs leading-relaxed text-[#F5F7FA]/90">
                        {item.description}
                      </p>

                      <div className="p-2.5 rounded-lg bg-[#08090B] border border-[#252936] text-[11px] text-[#A6ACB8] space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-violet-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Actionable Resolution Strategy:</span>
                        </div>
                        <p>{item.actionRecommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
