"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#1A1108] flex flex-col items-center justify-center text-[#F5EDD4] p-8 text-center relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      <AlertTriangle className="w-24 h-24 text-[#C0392B] mb-6 animate-pulse" />
      <h2 className="text-5xl font-heading tracking-widest text-[#F5C842] mb-4">CRITICAL FAILURE</h2>
      <p className="text-xl font-mono text-[#8B6914] mb-8 max-w-lg">
        The memory fragment is corrupted or the connection was lost. We couldn't reconstruct what happened.
      </p>
      
      <div className="bg-[#0D0D0D] border border-[#C0392B] p-4 text-left text-sm font-mono text-[#C0392B] mb-8 rounded max-w-2xl w-full overflow-auto max-h-48">
        {error.message || "Unknown error occurred"}
      </div>

      <button
        onClick={reset}
        className="bg-[#C0392B] hover:bg-red-600 text-white px-8 py-4 font-heading tracking-widest text-2xl transition-colors shadow-lg"
      >
        REBOOT SYSTEM
      </button>
    </div>
  );
}
