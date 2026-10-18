import React from 'react';

interface FooterProps {
  variant?: 'landing' | 'workspace' | 'drawer';
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ variant = 'workspace', onNavigateTab }) => {
  if (variant === 'drawer') {
    return (
      <div className="pt-3 border-t border-[#252936] text-center">
        <p className="text-[11px] text-[#A6ACB8]/80 font-medium tracking-tight">
          &copy; 2026 Ayush Singh. All rights reserved.
        </p>
      </div>
    );
  }

  if (variant === 'landing') {
    return (
      <footer className="border-t border-[#252936] py-8 px-4 sm:px-6 text-xs text-[#A6ACB8] bg-[#08090B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="font-bold text-[#F5F7FA]">Notice Decoder</span>
            <span aria-hidden="true" className="hidden sm:inline text-neutral-600">&middot;</span>
            <span className="text-[11px] text-[#A6ACB8]">Academic Change Intelligence &bull; SETU 2026</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-xs text-[#A6ACB8] font-medium tracking-normal select-none">
              &copy; 2026 Ayush Singh. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Workspace variant (in normal document flow at bottom of tab content)
  return (
    <footer className="mt-8 pt-4 pb-6 border-t border-[#252936]/60 text-xs text-[#A6ACB8] select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-semibold text-[#F5F7FA]">Notice Decoder</span>
          <span aria-hidden="true" className="text-neutral-600">&middot;</span>
          <span className="text-[#A6ACB8]/90">PS-02 Academic Intelligence</span>
        </div>
        <p className="text-[11px] text-[#A6ACB8] font-medium">
          &copy; 2026 Ayush Singh. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
