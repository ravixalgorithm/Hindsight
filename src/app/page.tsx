"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { DETECTIVE_FRAGMENTS } from "@/lib/detective/fragments";
import { useDatasetSession } from "@/hooks/useDatasetSession";

export default function LandingPage() {
  const router = useRouter();
  const { detectiveDatasetName, researchDatasetName, setActiveDatasetMode } = useDatasetSession();
  const [mode, setMode] = useState<"detective" | "research">("detective");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCascade, setShowCascade] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleIngest = async (sources: any[], datasetToUse: string, isDetective: boolean) => {
    setActiveDatasetMode(isDetective ? 'detective' : 'research');
    setIsUploading(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: datasetToUse,
          sources,
          mode: isDetective ? 'detective' : 'research'
        }),
      });
      if (res.ok) {
        router.push("/board");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Upload failed: ${errData.error || 'Server unreachable'}`);
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
      setIsUploading(false);
    }
  };

  const startDetectiveFlow = () => {
    setShowCascade(true);
    setTimeout(() => {
      handleIngest(DETECTIVE_FRAGMENTS, detectiveDatasetName, true);
    }, 2000); // 2 second delay for cascade animation
  };

  const startResearchFlow = () => {
    handleIngest([{ type: "url", content: "https://en.wikipedia.org/wiki/Las_Vegas" }], researchDatasetName, false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center justify-center pt-16">
      
      {/* Ghost Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden mix-blend-overlay">
        <h1 className="text-[25vw] font-heading text-white opacity-5 whitespace-nowrap leading-none">
          WHAT HAPPENED LAST NIGHT?
        </h1>
      </div>

      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="text-[#F5C842] font-heading tracking-widest text-[96px] leading-none drop-shadow-[0_0_15px_rgba(245,200,66,0.5)]">
          HINDSIGHT
        </div>
        <div className="text-xl font-body text-[#F0E6CC] opacity-70 mt-auto pb-4 uppercase tracking-widest">
          The morning after. Reconstructed.
        </div>
      </header>

      {/* Mode Toggle */}
      <div className="absolute top-8 right-8 flex bg-[#2C1F0E] p-1 rounded-sm border border-[#6B4F2A] shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-30 pointer-events-auto">
        <button
          onClick={() => setMode("detective")}
          className={`px-4 py-2 font-heading tracking-widest transition-all ${
            mode === "detective" 
              ? "bg-[#F0E6CC] text-[#1A1108] shadow-sm" 
              : "text-[#8B6914] hover:text-[#F0E6CC]"
          }`}
        >
          🕵️ DETECTIVE
        </button>
        <button
          onClick={() => setMode("research")}
          className={`px-4 py-2 font-heading tracking-widest transition-all ${
            mode === "research" 
              ? "bg-[#F0E6CC] text-[#1A1108] shadow-sm" 
              : "text-[#8B6914] hover:text-[#F0E6CC]"
          }`}
        >
          🔬 RESEARCH
        </button>
      </div>

      {/* Main Content */}
      <main className="z-10 flex flex-col items-center text-center max-w-3xl w-full px-6">
        {/* Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full max-w-xl aspect-[3/1] rounded border-2 cursor-pointer hover:bg-[#6B4F2A]/50 ${isDragging ? 'border-solid border-[#F5EDD4] bg-[#F5C842]/20' : 'border-dashed border-[#F5C842] bg-[#6B4F2A]/30'} overflow-hidden mb-8 flex flex-col items-center justify-center shadow-inner transition-colors`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragging(false);
            
            const files = Array.from(e.dataTransfer.files);
            const text = e.dataTransfer.getData('text');
            const url = e.dataTransfer.getData('URL');

            const sources: any[] = [];

            if (files.length > 0) {
              for (const file of files) {
                const content = await file.text();
                sources.push({ type: 'text', content, source: file.name });
              }
            } else if (url) {
              sources.push({ type: 'url', content: url });
            } else if (text) {
              sources.push({ type: 'text', content: text });
            }

            if (sources.length > 0) {
              handleIngest(sources, mode === 'detective' ? detectiveDatasetName : researchDatasetName, mode === 'detective');
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              const sources: any[] = [];
              for (const file of files) {
                const content = await file.text();
                sources.push({ type: 'text', content, source: file.name });
              }
              if (sources.length > 0) {
                handleIngest(sources, mode === 'detective' ? detectiveDatasetName : researchDatasetName, mode === 'detective');
              }
              e.target.value = '';
            }}
          />
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')", mixBlendMode: 'overlay' }} />
          
          <div className="relative z-10 flex items-center gap-3 text-[#F5C842]">
            <span className="font-body text-lg font-bold">
              Drop evidence here — text, files, or URLs
            </span>
          </div>
          
          <AnimatePresence>
            {showCascade && DETECTIVE_FRAGMENTS.map((frag, i) => (
              <motion.div
                key={frag.id}
                initial={{ opacity: 0, y: -150, rotate: Math.random() * 20 - 10, x: Math.random() * 100 - 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                className="absolute w-24 h-16 bg-[#F5EDD4] shadow-lg border border-[#8B6914] p-2 flex flex-col pointer-events-none index-card"
              >
                <div className="text-[6px] font-heading font-bold text-[#C0392B] border-b border-[#8B6914] pb-0.5">{frag.type.toUpperCase()}</div>
                <div className="text-[4px] mt-1 font-body text-[#1A1108] leading-tight overflow-hidden">{frag.content}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {mode === "detective" ? (
            <motion.div
              key="detective"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                onClick={startDetectiveFlow}
                disabled={isUploading || showCascade}
                className="bg-[#F5C842] text-[#1A1108] px-12 py-6 font-heading text-4xl tracking-widest shadow-[0_0_25px_rgba(245,200,66,0.4)] hover:shadow-[0_0_35px_rgba(245,200,66,0.6)] hover:bg-yellow-400 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
              >
                {isUploading ? "RECONSTRUCTING..." : "FIND DOUG"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="research"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => handleIngest([{ type: "url", content: "https://en.wikipedia.org/wiki/Las_Vegas" }], researchDatasetName, false)}
                  disabled={isUploading}
                  className="bg-[#38bdf8] text-[#1A1108] px-8 py-4 font-heading text-xl tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:bg-sky-400 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                  {isUploading ? "READING..." : "[1] LAS VEGAS WIKI"}
                </button>
                <button 
                  onClick={() => handleIngest([{ type: "url", content: "https://wemakedevs.org/hackathons/ai" }], researchDatasetName, false)}
                  disabled={isUploading}
                  className="bg-[#38bdf8] text-[#1A1108] px-8 py-4 font-heading text-xl tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:bg-sky-400 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                  {isUploading ? "READING..." : "[2] HACKATHON RULES"}
                </button>
                <button 
                  onClick={() => handleIngest([{ type: "text", content: "Review 1: Caesar's palace is huge. Review 2: The rooftop is locked at night. Review 3: You can see the whole strip from the roof." }], researchDatasetName, false)}
                  disabled={isUploading}
                  className="bg-[#38bdf8] text-[#1A1108] px-8 py-4 font-heading text-xl tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:bg-sky-400 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                  {isUploading ? "READING..." : "[3] CAESAR'S REVIEWS"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
