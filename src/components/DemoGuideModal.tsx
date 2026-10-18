import React from 'react';
import { X, CheckCircle2, ArrowRight, Play, RotateCcw, AlertTriangle, Sparkles, FileText, Download } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadOriginalNotice: () => void;
  onLoadRevisionNotice: () => void;
  onResetDemo: () => void;
  currentStep: number;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onLoadOriginalNotice,
  onLoadRevisionNotice,
  onResetDemo,
  currentStep,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Step 1: Decode Benchmark Notice',
      desc: 'Loads the official SETU 2026 PS-02 notice and extracts 4 academic events (Database Systems test, Guest Lecture, Lab Record deadline, Python lab).',
      actionLabel: 'Load Step 1 Notice',
      action: onLoadOriginalNotice,
    },
    {
      num: 2,
      title: 'Step 2: Conflict Engine Detection',
      desc: 'Notice Decoder mathematically evaluates time intervals: detects the 30-min overlap (11:00–11:30) and the 12:00 PM deadline collision during the lecture.',
    },
    {
      num: 3,
      title: 'Step 3: Process Revision Notice',
      desc: 'Simulates the department posting a revised schedule: Database Systems exam shifted from 10:00–11:30 AM to 1:00–2:30 PM.',
      actionLabel: 'Load Step 2 Revision',
      action: onLoadRevisionNotice,
    },
    {
      num: 4,
      title: 'Step 4: Change Intelligence & Impact',
      desc: 'Notice-to-notice comparator flags the time change, links source text, and calculates that the 30-min overlap with Guest Lecture is resolved.',
    },
    {
      num: 5,
      title: 'Step 5: Confirm Revision & Export Calendar',
      desc: 'Judge clicks "Confirm Change". Schedule updates, overlap clears, history is recorded, and the verified .ics file can be exported.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0F1115] border border-[#252936] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252936] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Play className="w-4 h-4 fill-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">
                SETU 2026 Judge Walkthrough Guide
              </h3>
              <p className="text-[11px] text-[#A6ACB8]">
                Deterministic 5-Step Evaluation Scenario for PS-02
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

        {/* Steps List */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {steps.map((st) => (
            <div
              key={st.num}
              className={`p-4 rounded-lg border transition-all ${
                currentStep === st.num
                  ? 'bg-violet-950/20 border-violet-500/40'
                  : 'bg-[#151820] border-[#252936]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-violet-400">
                      0{st.num}.
                    </span>
                    <h4 className="text-xs font-semibold text-[#F5F7FA]">{st.title}</h4>
                  </div>
                  <p className="text-xs text-[#A6ACB8] leading-relaxed">{st.desc}</p>
                </div>

                {st.action && (
                  <button
                    onClick={() => {
                      st.action();
                      onClose();
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>{st.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Reset */}
        <div className="px-6 py-3 border-t border-[#252936] bg-[#151820] flex items-center justify-between">
          <button
            onClick={() => {
              onResetDemo();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-[#A6ACB8] hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Clean State</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#F5F7FA] bg-[#0F1115] hover:bg-[#1a1e28] border border-[#252936] rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
