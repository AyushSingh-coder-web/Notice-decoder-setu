import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 1000,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const duration = prefersReducedMotion ? 200 : minDurationMs;

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const destroyTimer = setTimeout(() => {
        setIsDestroyed(true);
        if (onFinish) {
          onFinish();
        }
      }, 350); // Match fade transition duration

      return () => clearTimeout(destroyTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [minDurationMs, onFinish]);

  if (isDestroyed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notice Decoder initializing"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#08090B] select-none transition-opacity duration-300 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle ambient glow accent behind logo */}
      <div
        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-violet-600/20 via-cyan-500/15 to-transparent blur-3xl pointer-events-none animate-pulse"
        style={{ animationDuration: '3s' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* Animated Emblem / Logo Box */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#151820] to-[#0F1115] border border-violet-500/40 flex items-center justify-center text-violet-400 font-extrabold text-2xl shadow-xl shadow-violet-950/60 ring-1 ring-cyan-400/20">
            N
          </div>
          <div className="absolute -top-1.5 -right-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>
          </div>
        </div>

        {/* Product Identity */}
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
          Notice Decoder
        </h1>

        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-violet-300 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Academic Change Intelligence</span>
        </div>

        {/* Minimal Indeterminate Progress Bar */}
        <div className="w-48 h-1 bg-[#151820] rounded-full overflow-hidden mt-6 border border-[#252936]">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 rounded-full animate-indeterminate"
            style={{
              width: '60%',
              animation: 'indeterminate 1.2s infinite linear',
            }}
          />
        </div>

        <p className="text-[11px] text-[#A6ACB8]/80 mt-3 font-mono">
          Readying schedule models...
        </p>
      </div>

      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
