import React from 'react';
import { Bot, Play, Sun, Moon, Sparkles, AlertTriangle, Menu } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAssistant: () => void;
  onOpenDemoGuide: () => void;
  onNavigateToLanding?: () => void;
  onOpenMobileNav?: () => void;
  onNavigateToConflicts?: () => void;
  hasUnreviewedChanges: boolean;
  activeConflictCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  theme,
  onToggleTheme,
  onOpenAssistant,
  onOpenDemoGuide,
  onNavigateToLanding,
  onOpenMobileNav,
  onNavigateToConflicts,
  hasUnreviewedChanges,
  activeConflictCount,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#252936] bg-[#0F1115]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0 select-none">
      {/* Zone 1: Brand & Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
        <div
          onClick={onNavigateToLanding}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 group-hover:bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-base transition-colors shrink-0 shadow-sm shadow-violet-900/20">
            N
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#F5F7FA] group-hover:text-violet-300 transition-colors truncate">
              Notice Decoder
            </span>
            <span className="text-[10px] text-[#A6ACB8] font-medium hidden min-[1200px]:inline truncate">
              Academic Change Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Conflict Indicator & Desktop Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#A6ACB8] min-w-0">
        {/* Desktop Breadcrumb: Only at ≥ 1200px */}
        <div className="hidden min-[1200px]:flex items-center gap-2 text-xs text-[#A6ACB8] font-medium shrink-0">
          <span>Workspace</span>
          <span aria-hidden="true" className="text-neutral-600">/</span>
          <span className="text-[#F5F7FA] capitalize">{currentTab.replace('-', ' ')}</span>
        </div>

        {/* Active Conflict Warning: Always visible across all breakpoints (Desktop, Tablet, Mobile <= 450px) */}
        {activeConflictCount > 0 && (
          <button
            type="button"
            onClick={onNavigateToConflicts}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 transition-colors shrink-0 cursor-pointer min-h-[38px] active:scale-95"
            aria-label={`${activeConflictCount} academic schedule conflicts detected`}
            title="Click to view schedule conflicts in Intelligence engine"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="tabular-nums font-mono font-bold">{activeConflictCount}</span>
            <span className="truncate">Conflict{activeConflictCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Desktop Revision Indicator: Only at ≥ 1200px */}
        {hasUnreviewedChanges && (
          <span className="hidden min-[1200px]:inline-flex items-center gap-1 text-xs text-cyan-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Revision Pending</span>
          </span>
        )}
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Desktop Actions: Only at ≥ 1200px */}
        <div className="hidden min-[1200px]:flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/50 rounded-lg transition-colors whitespace-nowrap min-h-[36px]"
            title="Open Hackathon Demo Walkthrough"
          >
            <Play className="w-3.5 h-3.5 fill-violet-400 text-violet-400 shrink-0" />
            <span>Demo Walkthrough</span>
          </button>

          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] rounded-lg transition-colors whitespace-nowrap min-h-[36px]"
            title="Ask Nexa AI"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Nexa AI</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] border border-transparent hover:border-[#252936] rounded-lg transition-colors shrink-0"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
          </button>
        </div>

        {/* Hamburger Menu Trigger: Visible on Tablet and Mobile (<= 1199px) */}
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="min-[1200px]:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] rounded-lg border border-[#252936] transition-colors shrink-0"
            aria-label="Open Workspace Navigation & Tools Menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-[#F5F7FA]" />
          </button>
        )}
      </div>
    </header>
  );
};
