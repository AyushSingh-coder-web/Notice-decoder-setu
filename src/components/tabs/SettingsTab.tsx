import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Bot,
  Database,
  RotateCcw,
  Trash2,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SettingsTabProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onResetDemo: () => void;
  onClearAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  theme,
  onToggleTheme,
  onResetDemo,
  onClearAllData,
}) => {
  const [healthStatus, setHealthStatus] = useState<{
    loaded: boolean;
    aiConfigured: boolean;
    appName?: string;
  }>({ loaded: false, aiConfigured: false });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus({
          loaded: true,
          aiConfigured: Boolean(data.aiConfigured),
          appName: data.appName,
        });
      })
      .catch((err) => {
        setHealthStatus({ loaded: true, aiConfigured: false });
      });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#252936] pb-4">
        <h2 className="text-base font-bold text-[#F5F7FA]">Settings & System Verification</h2>
        <p className="text-xs text-[#A6ACB8]">
          Architecture transparency, AI runtime status, and local storage controls.
        </p>
      </div>

      <div className="space-y-4">
        {/* AI Runtime Verification Card */}
        <div className="p-5 rounded-xl bg-[#0F1115] border border-[#252936] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F5F7FA]">AI Integration Architecture</h3>
                <p className="text-xs text-[#A6ACB8]">
                  Dual-tier design: server-side Gemini 2.5 Flash + deterministic local engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {healthStatus.loaded ? (
                healthStatus.aiConfigured ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Gemini API Online</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>Local Deterministic Mode Active</span>
                  </span>
                )
              ) : (
                <span className="text-xs text-[#A6ACB8]">Checking backend status...</span>
              )}
            </div>
          </div>

          <p className="text-xs text-[#A6ACB8] leading-relaxed">
            {healthStatus.aiConfigured
              ? 'Server-side GEMINI_API_KEY is detected. Extraction enhancement and Nexa AI responses utilize Gemini 2.5 Flash with strict grounding on your notices and conflict records.'
              : 'Server-side GEMINI_API_KEY is currently unset or in offline evaluation. Notice Decoder automatically operates in Local Deterministic Mode — all 4 benchmark events, overlap intervals, deadline collisions, revision comparisons, and .ics calendar exports are calculated 100% locally with zero external API dependencies.'}
          </p>
        </div>

        {/* Honest Privacy & Storage Card */}
        <div className="p-5 rounded-xl bg-[#0F1115] border border-[#252936] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-950/40 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Honest Privacy & Data Governance</h3>
              <p className="text-xs text-[#A6ACB8]">Client-side local persistence</p>
            </div>
          </div>

          <p className="text-xs text-[#A6ACB8] leading-relaxed">
            All notice texts, extracted schedules, detected revisions, and confirmation logs remain strictly on your client device inside browser <code className="text-violet-300">localStorage</code>. Notice Decoder does not log your academic data or store notices on a remote database.
          </p>
        </div>

        {/* Theme Preferences */}
        <div className="p-5 rounded-xl bg-[#0F1115] border border-[#252936] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F7FA]">Theme Preference</h3>
            <p className="text-xs text-[#A6ACB8]">
              Switch between Dark (#08090B) and Light (#F8FAFC) palette
            </p>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1f2432] border border-[#252936] rounded-lg transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
            <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
          </button>
        </div>

        {/* Hackathon Reset & Data Actions */}
        <div className="p-5 rounded-xl bg-[#0F1115] border border-[#252936] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#F5F7FA]">Demonstration Reset Actions</h3>
            <p className="text-xs text-[#A6ACB8]">
              Reset demo data or clear all records for judging repeatability
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onResetDemo}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Reload Benchmark Demo (Step 1)</span>
            </button>

            <button
              onClick={onClearAllData}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Stored Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
