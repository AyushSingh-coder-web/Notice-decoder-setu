import React, { useState, useEffect } from 'react';
import {
  Calendar,
  GitCompare,
  ShieldAlert,
  Bot,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  Clock,
  Sparkles,
  FileText,
  Upload,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  Menu,
  X,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { Footer } from './Footer';

interface LandingViewProps {
  onEnterWorkspace: () => void;
  onNavigateToDecode: () => void;
  onLaunchDemo1: () => void;
  onLaunchTestNotice: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterWorkspace,
  onNavigateToDecode,
  onLaunchDemo1,
  onLaunchTestNotice,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key press & prevent background scrolling
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] font-sans selection:bg-violet-600/30 selection:text-white flex flex-col">
      {/* Landing Sticky Top Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#08090B]/90 border-b border-[#252936] px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-base shadow-sm shadow-violet-900/30">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-[#F5F7FA] whitespace-nowrap">
                Notice Decoder
              </span>
              <span className="text-[10px] text-[#A6ACB8] font-medium hidden sm:inline whitespace-nowrap">
                Academic Change Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links: Full horizontal layout ONLY at ≥ 1200px */}
          <nav className="hidden min-[1200px]:flex items-center gap-6 text-xs font-medium text-[#A6ACB8]">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-[#F5F7FA] transition-colors whitespace-nowrap"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('workflow')}
              className="hover:text-[#F5F7FA] transition-colors whitespace-nowrap"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('preview')}
              className="hover:text-[#F5F7FA] transition-colors whitespace-nowrap"
            >
              Product Preview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benchmark')}
              className="hover:text-[#F5F7FA] transition-colors whitespace-nowrap"
            >
              SETU 2026 Benchmark
            </button>
          </nav>

          {/* Desktop Actions: ONLY at ≥ 1200px */}
          <div className="hidden min-[1200px]:flex items-center gap-3 shrink-0">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] border border-transparent hover:border-[#252936] rounded-lg transition-colors shrink-0"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
              </button>
            )}

            <button
              type="button"
              onClick={onEnterWorkspace}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] border border-transparent hover:border-[#252936] rounded-lg transition-colors whitespace-nowrap min-h-[38px]"
            >
              Open Workspace
            </button>

            <button
              type="button"
              onClick={onNavigateToDecode}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-md shadow-violet-900/40 transition-all whitespace-nowrap min-h-[38px]"
            >
              <span>Decode a Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hamburger Menu Trigger: Visible on Tablet and Mobile (<= 1199px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="min-[1200px]:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] rounded-lg border border-[#252936] transition-colors shrink-0"
            aria-label="Open Landing Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-[#F5F7FA]" />
          </button>
        </div>
      </header>

      {/* Slide-in Drawer for Landing Navigation at <= 1199px - Slides from right toward left */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 min-[1200px]:hidden flex justify-end">
          {/* Dimmed backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-in drawer panel (slides in from right to left) */}
          <div
            className="relative z-50 w-80 max-w-[88vw] ml-auto bg-[#0F1115] border-l border-[#252936] flex flex-col h-[100dvh] shadow-2xl slide-in-from-right"
            role="dialog"
            aria-modal="true"
            aria-label="Hero Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="h-16 px-4 border-b border-[#252936] flex items-center justify-between shrink-0 bg-[#0F1115]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#F5F7FA]">Notice Decoder</span>
                  <span className="text-[10px] text-[#A6ACB8]">Academic Intelligence</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* Theme toggle option in drawer */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] transition-colors min-h-[44px]"
                >
                  <span className="text-xs text-[#A6ACB8]">Interface Theme</span>
                  <div className="flex items-center gap-1.5 text-xs text-[#F5F7FA]">
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-violet-400" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </div>
                </button>
              )}

              {/* Primary Call to Action buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToDecode();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-900/40 min-h-[44px] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Decode a Notice</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnterWorkspace();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] rounded-xl min-h-[44px] transition-colors"
                >
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Explore Workspace</span>
                </button>
              </div>

              {/* Navigation Section */}
              <div className="pt-2 border-t border-[#252936]/60 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-[#A6ACB8] uppercase">
                  Page Sections
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="w-full text-left px-3 py-2.5 text-xs text-[#A6ACB8] hover:text-white rounded-lg hover:bg-[#151820] transition-colors min-h-[44px] flex items-center justify-between"
                >
                  <span>Features & Capabilities</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('workflow')}
                  className="w-full text-left px-3 py-2.5 text-xs text-[#A6ACB8] hover:text-white rounded-lg hover:bg-[#151820] transition-colors min-h-[44px] flex items-center justify-between"
                >
                  <span>How It Works</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('preview')}
                  className="w-full text-left px-3 py-2.5 text-xs text-[#A6ACB8] hover:text-white rounded-lg hover:bg-[#151820] transition-colors min-h-[44px] flex items-center justify-between"
                >
                  <span>Product Preview</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('benchmark')}
                  className="w-full text-left px-3 py-2.5 text-xs text-[#A6ACB8] hover:text-white rounded-lg hover:bg-[#151820] transition-colors min-h-[44px] flex items-center justify-between"
                >
                  <span>SETU 2026 PS-02 Benchmark</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Drawer Bottom Footer */}
            <div className="p-3 shrink-0 border-t border-[#252936] bg-[#0F1115]">
              <Footer variant="drawer" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-20 max-w-7xl mx-auto overflow-hidden">
          {/* Ambient background glow accents */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

          <div className="relative text-center space-y-5 sm:space-y-6 max-w-4xl mx-auto">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-violet-300 bg-violet-950/40 border border-violet-700/50 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI-Powered Academic Change Intelligence</span>
              <span aria-hidden="true" className="text-violet-500">&middot;</span>
              <span className="text-[11px] text-[#A6ACB8]">SETU 2026 PS-02</span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F7FA] leading-[1.15]">
              College Notices, Decoded.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-indigo-300">
                Your Schedule, Under Control.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base lg:text-lg text-[#A6ACB8] max-w-2xl mx-auto leading-relaxed px-2">
              Turn college notices into structured events, detect schedule conflicts, track important deadlines, and keep your academic calendar up to date &mdash; powered by AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToDecode}
                className="flex items-center gap-2 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-900/40 hover:shadow-violet-800/60 transition-all hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
              >
                <FileText className="w-4 h-4" />
                <span>Decode a Notice</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onEnterWorkspace}
                className="flex items-center gap-2 px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] hover:border-violet-500/40 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
              >
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Explore Workspace</span>
              </button>

              <button
                type="button"
                onClick={onLaunchTestNotice}
                className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-700/40 rounded-xl transition-all min-h-[44px]"
                title="Test the CSE II-Year notice with inferred year and OCR typos"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                <span>Try CSE II-Year Test Notice</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#A6ACB8] pt-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contextual Year Inference</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interval Overlap Arithmetic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Standards-Compliant .ics Export</span>
              </div>
            </div>
          </div>

          {/* Visual Product Preview */}
          <div id="preview" className="mt-12 sm:mt-14 max-w-6xl mx-auto rounded-2xl bg-[#0F1115] border border-[#252936] p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#252936] pb-3 text-xs text-[#A6ACB8]">
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-[#F5F7FA]">Interactive Transformation Engine</span>
              </div>
              <span className="font-mono text-[11px] text-cyan-400">Notice Decoder v2.0 &bull; Live Execution</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* 1. Raw Notice Ingestion (Left, 4 cols) */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-[#151820] border border-[#252936] flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-violet-400 uppercase tracking-wider text-[10px]">
                      Incoming College Circular
                    </span>
                    <span className="text-[10px] text-[#A6ACB8]">Raw Input</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#08090B] border border-[#252936] font-mono text-[11px] text-[#A6ACB8] leading-relaxed select-none">
                    <span className="text-cyan-300 font-semibold">All Il-year CSE students:</span> Internal Test 2 will be held on <span className="text-white">13 Nov 2026 from 10:00 AM to 11:30 AM in Room 204</span>. Lab records must be submitted to the department office by <span className="text-rose-300">12:00 noon on 13 Nov</span>. A guest lecture on <span className="text-amber-300">&lsquo;Al in Healthcare&rsquo;</span> is scheduled on 13 Nov, 11:00 AM to 12:30 PM, Seminar Hall.
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252936] text-[11px] text-[#A6ACB8] flex items-center justify-between">
                  <span>Supports .txt &amp; .pdf notices</span>
                  <span className="font-mono text-emerald-400">Context Resolved</span>
                </div>
              </div>

              {/* 2. Structured Extracted Events (Middle, 4 cols) */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-[#151820] border border-cyan-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px]">
                      Structured AI Entities
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">3 Candidates</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Event 1 */}
                    <div className="p-2.5 rounded-lg bg-[#0F1115] border border-[#252936] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F5F7FA]">Internal Test 2</span>
                        <span className="text-[10px] text-violet-400 font-mono">EXAM</span>
                      </div>
                      <div className="text-[11px] text-[#A6ACB8] font-mono">
                        Nov 13, 2026 &middot; 10:00 &ndash; 11:30 AM &middot; Room 204
                      </div>
                    </div>

                    {/* Event 2 */}
                    <div className="p-2.5 rounded-lg bg-[#0F1115] border border-[#252936] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F5F7FA]">Lab Record Submission</span>
                        <span className="text-[10px] text-rose-400 font-mono">DEADLINE</span>
                      </div>
                      <div className="text-[11px] text-[#A6ACB8] font-mono">
                        Nov 13, 2026 &middot; Due: 12:00 PM &middot; Dept Office
                      </div>
                      <span className="text-[9px] text-cyan-400 block font-sans">
                        *Year 2026 inferred from notice context
                      </span>
                    </div>

                    {/* Event 3 */}
                    <div className="p-2.5 rounded-lg bg-[#0F1115] border border-[#252936] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F5F7FA]">Guest Lecture: AI in Healthcare</span>
                        <span className="text-[10px] text-amber-400 font-mono">LECTURE</span>
                      </div>
                      <div className="text-[11px] text-[#A6ACB8] font-mono">
                        Nov 13, 2026 &middot; 11:00 AM &ndash; 12:30 PM &middot; Seminar Hall
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252936] text-[11px] text-cyan-300 flex items-center justify-between">
                  <span>Ambiguities Flagged: 2</span>
                  <span className="font-mono">Ready to Verify</span>
                </div>
              </div>

              {/* 3. Mathematical Impact Radar & Conflict (Right, 4 cols) */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-gradient-to-b from-[#151820] to-[#0F1115] border border-amber-500/40 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                      Academic Impact Radar
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono">2 Collisions</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Warning 1 */}
                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/40 space-y-1 text-rose-200">
                      <div className="flex items-center gap-1.5 font-bold text-rose-400 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Direct 30-min Schedule Overlap</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[#F5F7FA]">
                        Internal Test 2 (10:00&ndash;11:30) overlaps with Guest Lecture (11:00&ndash;12:30) on Nov 13.
                      </p>
                    </div>

                    {/* Warning 2 */}
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 space-y-1 text-amber-200">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Mid-Session Deadline Collision</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[#F5F7FA]">
                        12:00 PM cutoff occurs during Guest Lecture (11:00&ndash;12:30).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252936] flex items-center justify-between">
                  <span className="text-[11px] text-[#A6ACB8]">Calendar Status</span>
                  <span className="text-xs font-semibold text-violet-400">Export Ready (.ics)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section id="features" className="px-4 sm:px-6 py-16 sm:py-20 max-w-7xl mx-auto border-t border-[#252936] space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              Three Connected Signature Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
              Engineered for Serious Academic Productivity
            </h2>
            <p className="text-xs sm:text-sm text-[#A6ACB8]">
              Notice Decoder replaces manual copy-pasting and fragmented calendar reminders with verifiable change intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#0F1115] border border-[#252936] hover:border-violet-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA]">1. Context-Aware Notice Extraction</h3>
              <p className="text-xs text-[#A6ACB8] leading-relaxed">
                Upload PDF notices or paste text. Powered by server-side Gemini 2.5 Flash, the pipeline extracts events, dates, and times, infers missing years from surrounding context, identifies specific student cohorts, and flags ambiguous OCR text for verification.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#0F1115] border border-[#252936] hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA]">2. Notice Change Intelligence</h3>
              <p className="text-xs text-[#A6ACB8] leading-relaxed">
                When a rescheduled announcement is issued, Notice Decoder compares it side-by-side with your active schedule. Review previous vs revised values, understand how the change impacts existing overlaps, and confirm before updating your calendar.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#0F1115] border border-[#252936] hover:border-amber-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA]">3. Mathematical Conflict Engine</h3>
              <p className="text-xs text-[#A6ACB8] leading-relaxed">
                Evaluates pure interval intersection (<code className="text-violet-300">startA &lt; endB &amp;&amp; startB &lt; endA</code>) and mid-session deadline collisions (<code className="text-cyan-300">S &le; D &amp;&amp; D &lt; E</code>). No invented conflicts, no hallucinated stress metrics.
              </p>
            </div>
          </div>
        </section>

        {/* 3-Step Workflow Section */}
        <section id="workflow" className="px-4 sm:px-6 py-16 sm:py-20 max-w-7xl mx-auto border-t border-[#252936] space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Clear, Verifiable Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
              From Circular to Calendar in Seconds
            </h2>
            <p className="text-xs sm:text-sm text-[#A6ACB8]">
              Notice Decoder keeps you in complete control at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0F1115] border border-[#252936] space-y-3">
              <span className="font-mono text-sm font-bold text-violet-400">01. Ingest Notice</span>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Upload PDF or Paste Text</h3>
              <p className="text-xs text-[#A6ACB8] leading-relaxed">
                Upload official college circulars or paste WhatsApp memo messages. Text is parsed cleanly without storing your private data on remote databases.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1115] border border-[#252936] space-y-3">
              <span className="font-mono text-sm font-bold text-cyan-400">02. Inspect &amp; Verify</span>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Review Extracted Candidates</h3>
              <p className="text-xs text-[#A6ACB8] leading-relaxed">
                Examine candidate cards, view exact notice excerpts, check inferred date fields, edit details, and approve verified academic events.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1115] border border-[#252936] space-y-3">
              <span className="font-mono text-sm font-bold text-emerald-400">03. Resolve &amp; Export</span>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Reconcile Changes &amp; Export .ics</h3>
              <p className="text-xs text-[#A6ACB8] leading-relaxed">
                Let Change Intelligence detect revised exam schedules, watch schedule overlaps clear upon confirmation, and download your verified iCalendar file.
              </p>
            </div>
          </div>
        </section>

        {/* Benchmark Verification Section */}
        <section id="benchmark" className="px-4 sm:px-6 py-14 sm:py-16 max-w-7xl mx-auto border-t border-[#252936] space-y-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#151820] via-[#0F1115] to-[#151820] border border-violet-500/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                  Hackathon Verification Ready
                </span>
                <span className="text-[11px] text-[#A6ACB8]">&middot; SETU 2026 PS-02</span>
              </div>
              <h3 className="text-xl font-bold text-[#F5F7FA]">
                Test the Official Benchmark Scenarios
              </h3>
              <p className="text-xs text-[#A6ACB8] leading-relaxed">
                Evaluate Notice Decoder immediately without typing manually. Load the original benchmark notice with overlapping exams, followed by the revision announcement that resolves the conflict.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={onLaunchDemo1}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-900/40 transition-all whitespace-nowrap min-h-[44px]"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Load Benchmark (Step 1)</span>
              </button>

              <button
                type="button"
                onClick={onLaunchTestNotice}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-cyan-300 bg-[#151820] hover:bg-[#1e2330] border border-cyan-500/40 rounded-xl transition-all whitespace-nowrap min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load II-Year Test Notice</span>
              </button>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="px-4 sm:px-6 py-16 sm:py-20 max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            Ready to take control of your academic schedule?
          </h2>
          <p className="text-xs sm:text-sm text-[#A6ACB8] max-w-xl mx-auto leading-relaxed">
            Start decoding your department circulars today with verified event extraction, change tracking, and instant calendar export.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToDecode}
              className="flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-xl shadow-violet-900/50 transition-all min-h-[44px]"
            >
              <FileText className="w-4 h-4" />
              <span>Decode a Notice</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onEnterWorkspace}
              className="flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] rounded-xl transition-all min-h-[44px]"
            >
              <span>Open Application Workspace</span>
            </button>
          </div>
        </section>
      </div>

      {/* Shared Copyright Footer for Ayush Singh */}
      <Footer variant="landing" />
    </div>
  );
};
