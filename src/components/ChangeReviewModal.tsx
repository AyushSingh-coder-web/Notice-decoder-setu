import React from 'react';
import { X, Check, ArrowRight, AlertTriangle, ShieldCheck, Clock, Calendar, MapPin, Sparkles } from 'lucide-react';
import { ChangeRecord } from '../types';
import { formatDisplayDate, formatDisplayTime } from '../lib/dateTime';

interface ChangeReviewModalProps {
  change: ChangeRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (change: ChangeRecord) => void;
  onReject: (change: ChangeRecord) => void;
}

export const ChangeReviewModal: React.FC<ChangeReviewModalProps> = ({
  change,
  isOpen,
  onClose,
  onConfirm,
  onReject,
}) => {
  if (!isOpen || !change) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0F1115] border border-[#252936] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252936] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">
                Notice Change Review: {change.targetEventTitle}
              </h3>
              <p className="text-[11px] text-[#A6ACB8]">
                Classification: <span className="uppercase text-cyan-300 font-semibold">{change.changeClassification}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A6ACB8] hover:text-[#F5F7FA] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Side by side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Values */}
            <div className="p-4 rounded-lg bg-[#151820] border border-[#252936] space-y-3">
              <div className="text-xs font-semibold text-[#A6ACB8] flex items-center gap-1.5 uppercase tracking-wider">
                <span>Original Active Schedule</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#F5F7FA]">
                  <Calendar className="w-3.5 h-3.5 text-[#A6ACB8]" />
                  <span>{change.previousValues.date ? formatDisplayDate(change.previousValues.date) : 'Unchanged'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#F5F7FA] font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#A6ACB8]" />
                  <span>
                    {change.previousValues.startTime
                      ? `${formatDisplayTime(change.previousValues.startTime)} – ${formatDisplayTime(change.previousValues.endTime || null)}`
                      : change.previousValues.deadlineTime
                      ? `Deadline: ${formatDisplayTime(change.previousValues.deadlineTime)}`
                      : 'None'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#F5F7FA]">
                  <MapPin className="w-3.5 h-3.5 text-[#A6ACB8]" />
                  <span>{change.previousValues.venue || 'Campus'}</span>
                </div>
              </div>
            </div>

            {/* Proposed Values */}
            <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Proposed Notice Revision</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{change.proposedValues.date ? formatDisplayDate(change.proposedValues.date) : 'Same Date'}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-mono font-semibold">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {change.proposedValues.startTime
                      ? `${formatDisplayTime(change.proposedValues.startTime)} – ${formatDisplayTime(change.proposedValues.endTime || null)}`
                      : change.proposedValues.deadlineTime
                      ? `Deadline: ${formatDisplayTime(change.proposedValues.deadlineTime)}`
                      : 'None'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{change.proposedValues.venue || change.previousValues.venue || 'Campus'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Evidence Excerpt */}
          <div className="p-4 rounded-lg bg-[#151820] border border-[#252936] space-y-2">
            <span className="text-xs font-semibold text-[#A6ACB8] uppercase tracking-wider">
              Revision Source Excerpt
            </span>
            <p className="text-xs text-[#F5F7FA] italic bg-[#0F1115] p-3 rounded border border-[#252936]">
              "{change.supportingEvidence}"
            </p>
          </div>

          {/* Academic Schedule Impact Analysis */}
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Academic Impact Assessment</span>
            </div>
            <p className="text-xs text-[#F5F7FA] whitespace-pre-line leading-relaxed">
              {change.impactAnalysis}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-[#252936] bg-[#151820] flex items-center justify-between">
          <button
            onClick={() => {
              onReject(change);
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-[#A6ACB8] hover:text-red-400 transition-colors"
          >
            Keep Existing Schedule (Reject Revision)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A6ACB8] hover:text-[#F5F7FA] bg-[#0F1115] border border-[#252936] rounded-lg transition-colors"
            >
              Review Later
            </button>
            <button
              onClick={() => {
                onConfirm(change);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-900/30"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Revision & Update Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
