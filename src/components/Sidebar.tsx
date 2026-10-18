import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  FileSearch,
  GitCompare,
  CalendarDays,
  History,
  Settings,
  Sparkles,
  Info,
  X,
  Play,
  Bot,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';
import { Footer } from './Footer';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreviewedCount: number;
  activeConflictCount: number;
  isMobileNavOpen?: boolean;
  onCloseMobileNav?: () => void;
  onOpenDemoGuide?: () => void;
  onOpenAssistant?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreviewedCount,
  activeConflictCount,
  isMobileNavOpen = false,
  onCloseMobileNav,
  onOpenDemoGuide,
  onOpenAssistant,
  theme = 'dark',
  onToggleTheme,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: activeConflictCount > 0 ? `${activeConflictCount}` : undefined,
      badgeColor: 'text-amber-400',
    },
    {
      id: 'decode',
      label: 'Decode Notice',
      icon: FileSearch,
    },
    {
      id: 'intelligence',
      label: 'Change Intelligence',
      icon: GitCompare,
      badge: unreviewedCount > 0 ? `${unreviewedCount}` : undefined,
      badgeColor: 'text-cyan-400',
    },
    {
      id: 'calendar',
      label: 'Academic Schedule',
      icon: CalendarDays,
    },
    {
      id: 'history',
      label: 'Notice & Change History',
      icon: History,
    },
    {
      id: 'landing',
      label: 'Product Overview',
      icon: Info,
    },
    {
      id: 'settings',
      label: 'Settings & Status',
      icon: Settings,
    },
  ];

  // Close mobile drawer on Escape key press & prevent background scrolling
  useEffect(() => {
    if (!isMobileNavOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCloseMobileNav) {
        onCloseMobileNav();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileNavOpen, onCloseMobileNav]);

  // Navigation Links
  const renderNavLinks = () => (
    <nav className="flex flex-col gap-1 w-full" aria-label="Workspace Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap min-h-[44px] ${
              isActive
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-violet-400' : 'text-[#A6ACB8]'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[11px] font-mono font-semibold tabular-nums ml-2 shrink-0 ${
                  item.badgeColor || 'text-[#F5F7FA]'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  // Bottom Information Card
  const renderBottomCard = () => (
    <div className="p-3.5 rounded-xl bg-[#151820] border border-[#252936] text-[11px] text-[#A6ACB8] space-y-1.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[#F5F7FA] font-semibold text-xs">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <span>SETU 2026 PS-02</span>
      </div>
      <p className="leading-relaxed">
        Notice Decoder addresses the full cycle of academic announcement revisions, schedule overlap math, and evidence verification.
      </p>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sticky Sidebar (≥ 1200px) */}
      <aside className="hidden min-[1200px]:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100dvh-4rem)] border-r border-[#252936] bg-[#0F1115] select-none z-20">
        {/* Region 1: Header Label */}
        <div className="p-3 pb-1 shrink-0">
          <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-[#A6ACB8] uppercase">
            Workspace
          </div>
        </div>

        {/* Region 2: Navigation Group (Scrollable if viewport is short) */}
        <div className="px-3 flex-1 overflow-y-auto min-h-0">
          {renderNavLinks()}
        </div>

        {/* Region 3: Bottom Information Card */}
        <div className="p-3 shrink-0 mt-auto border-t border-[#252936]/50">
          {renderBottomCard()}
        </div>
      </aside>

      {/* 2. Mobile & Tablet Slide-in Drawer (≤ 1199px) - Slides in from right to left */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 min-[1200px]:hidden flex justify-end">
          {/* Dimmed backdrop overlay */}
          <div
            onClick={onCloseMobileNav}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-in Drawer Panel (slides in from right to left) */}
          <div
            className="relative z-50 w-80 max-w-[88vw] ml-auto bg-[#0F1115] border-l border-[#252936] flex flex-col h-[100dvh] shadow-2xl slide-in-from-right"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace Navigation & Tools Drawer"
          >
            {/* Drawer Top Header */}
            <div className="h-16 px-4 border-b border-[#252936] flex items-center justify-between shrink-0 bg-[#0F1115]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm shadow-sm">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#F5F7FA]">Notice Decoder</span>
                  <span className="text-[10px] text-[#A6ACB8]">Academic Intelligence</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobileNav}
                className="p-2 text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-3.5 flex-1 overflow-y-auto min-h-0 space-y-4">
              {/* Secondary Actions Row (Moved from Navbar at <= 1199px) */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold tracking-wider text-[#A6ACB8] uppercase">
                  Quick Actions
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {onOpenDemoGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMobileNav && onCloseMobileNav();
                        onOpenDemoGuide();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/50 transition-colors min-h-[44px]"
                    >
                      <Play className="w-4 h-4 fill-violet-400 text-violet-400 shrink-0" />
                      <span>Demo Walkthrough</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {onOpenAssistant && (
                      <button
                        type="button"
                        onClick={() => {
                          onCloseMobileNav && onCloseMobileNav();
                          onOpenAssistant();
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] transition-colors min-h-[44px]"
                      >
                        <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Nexa AI</span>
                      </button>
                    )}

                    {onToggleTheme && (
                      <button
                        type="button"
                        onClick={onToggleTheme}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] transition-colors min-h-[44px]"
                        aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                      >
                        {theme === 'dark' ? (
                          <>
                            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Light</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 text-violet-400 shrink-0" />
                            <span>Dark</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Conflict Alert Banner if active */}
              {activeConflictCount > 0 && (
                <div
                  onClick={() => {
                    onSelectTab('intelligence');
                    onCloseMobileNav && onCloseMobileNav();
                  }}
                  className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-300 cursor-pointer hover:bg-amber-950/50 transition-colors space-y-1"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{activeConflictCount} Schedule Conflict{activeConflictCount > 1 ? 's' : ''} Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-tight">
                    Tap to inspect overlap arithmetic in the Intelligence engine.
                  </p>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1.5">
                <div className="px-1 text-[11px] font-bold tracking-wider text-[#A6ACB8] uppercase">
                  Workspace Navigation
                </div>
                {renderNavLinks()}
              </div>

              {/* Bottom Info Card */}
              {renderBottomCard()}
            </div>

            {/* Drawer Bottom Footer with Copyright */}
            <div className="p-3 shrink-0 border-t border-[#252936] bg-[#0F1115]">
              <Footer variant="drawer" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
