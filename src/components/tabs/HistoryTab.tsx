import React, { useState } from 'react';
import { History, FileText, Trash2, Calendar, Clock, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import { ChangeRecord, Notice } from '../../types';
import { formatDisplayDate } from '../../lib/dateTime';

interface HistoryTabProps {
  notices: Notice[];
  changes: ChangeRecord[];
  onDeleteNotice: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  notices,
  changes,
  onDeleteNotice,
  onClearHistory,
}) => {
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  const toggleNotice = (id: string) => {
    setExpandedNoticeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252936] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA]">Notice & Change Audit Log</h2>
          <p className="text-xs text-[#A6ACB8]">
            Full provenance tracking: notices, revisions, and historical audit trail.
          </p>
        </div>

        {notices.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 rounded-lg transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Processed Notices</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Processed Notices List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <span>Processed Notices ({notices.length})</span>
          </h3>

          {notices.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-2">
              <History className="w-8 h-8 text-[#A6ACB8] mx-auto" />
              <p className="text-xs text-[#A6ACB8]">No notices processed yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => {
                const isExpanded = expandedNoticeId === n.id;
                return (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-[#0F1115] border border-[#252936] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#F5F7FA]">{n.title}</span>
                          <span aria-hidden="true" className="text-neutral-600">·</span>
                          <span className="text-[#A6ACB8]">{new Date(n.processedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-violet-400">
                          {n.extractedCount} academic event{n.extractedCount !== 1 ? 's' : ''} extracted
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleNotice(n.id)}
                          className="p-1 text-[#A6ACB8] hover:text-[#F5F7FA] rounded transition-colors"
                          title="Toggle full text"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onDeleteNotice(n.id)}
                          className="p-1 text-[#A6ACB8] hover:text-red-400 rounded transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 rounded-lg bg-[#151820] border border-[#252936] text-xs font-mono text-[#F5F7FA] whitespace-pre-wrap leading-relaxed">
                        {n.rawText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Change History Log (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span>Revision Audit Trail ({changes.length})</span>
          </h3>

          {changes.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0F1115] border border-[#252936] text-center space-y-2">
              <p className="text-xs text-[#A6ACB8]">No change records recorded.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {changes.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-xl bg-[#0F1115] border border-[#252936] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F7FA]">{ch.targetEventTitle}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        ch.reviewStatus === 'confirmed'
                          ? 'text-emerald-400'
                          : ch.reviewStatus === 'rejected'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {ch.reviewStatus}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#A6ACB8] leading-relaxed">
                    {ch.impactAnalysis}
                  </p>

                  <div className="text-[10px] text-[#A6ACB8] font-mono pt-1 border-t border-[#252936]/60">
                    Logged: {new Date(ch.detectedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
