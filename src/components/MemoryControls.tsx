"use client";

import { useState } from "react";
import { Brain, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { GraphNode } from "./EvidenceBoard";

type Props = {
  onMemify: () => void;
  onForget: () => void;
  selectedNode?: GraphNode | null;
};

export default function MemoryControls({ onMemify, onForget, selectedNode }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleForgetClick = () => {
    if (showConfirm) {
      onForget();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Memify Toggle */}
      <button 
        onClick={onMemify}
        className="flex items-center gap-2 bg-near-black border border-card-brown px-4 py-2 text-parchment hover:bg-card-brown transition-colors rounded-sm shadow-lg font-heading tracking-wide"
      >
        <Brain className="w-5 h-5 text-gold" />
        IMPROVE MEMORY
      </button>

      {/* Forget Button */}
      <div className="relative">
        <AnimatePresence>
          {showConfirm && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full mb-2 right-0 bg-danger text-white p-3 rounded-sm shadow-xl font-body text-sm w-48 border border-white/20"
            >
              Mr. Chow will make this disappear. There's no going back. You sure?
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={handleForgetClick}
          onMouseLeave={() => setShowConfirm(false)}
          className={`flex items-center gap-2 px-4 py-2 transition-all rounded-sm shadow-lg font-heading tracking-wide ${
            showConfirm 
              ? "bg-danger text-white border border-danger/50 animate-pulse" 
              : "bg-near-black border border-danger/30 text-danger hover:bg-danger/10"
          }`}
        >
          <Trash2 className="w-5 h-5" />
          {selectedNode ? `FORGET: ${selectedNode.label.toUpperCase()}` : "MR. CHOW SAYS FORGET (CLEAR ALL)"}
        </button>
      </div>
    </div>
  );
}
