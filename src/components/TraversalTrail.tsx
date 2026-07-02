"use client";

import { ArrowRight, Search, Network } from "lucide-react";
import { motion } from "framer-motion";

export type TrailStep = {
  type?: 'vector' | 'graph';
  subject: string;
  relation?: string;
  object: string;
};

type Props = {
  trail: TrailStep[];
};

export default function TraversalTrail({ trail }: Props) {
  if (!trail || trail.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-[#F5C842]/30">
      <h3 className="font-heading tracking-widest text-[#F5C842] text-lg mb-4 flex items-center gap-2">
        <Network className="w-5 h-5" /> HOW WE FOUND IT
      </h3>
      
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
        {trail.map((step, index) => {
          const isVector = step.type === 'vector';
          const cardBg = isVector ? 'bg-[#0c4a6e]' : 'bg-[#F5EDD4]';
          const cardText = isVector ? 'text-[#38bdf8]' : 'text-[#1A1108]';
          const cardBorder = isVector ? 'border-[#0ea5e9]' : 'border-[#8B6914]';
          const relationBg = isVector ? 'bg-[#0ea5e9]/20 text-[#38bdf8]' : 'bg-[#C0392B]/10 text-[#C0392B]';

          return (
            <motion.div 
              key={index} 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.4, duration: 0.4 }}
            >
              {/* Phase Indicator */}
              {index === 0 && isVector && (
                <div className="flex flex-col items-center mr-2">
                  <div className="text-[10px] font-bold text-[#38bdf8] mb-1">VECTOR RECALL</div>
                </div>
              )}
              {index === 1 && !isVector && (
                <div className="flex flex-col items-center mr-2 ml-4">
                  <div className="text-[10px] font-bold text-[#F5C842] mb-1">GRAPH TRAVERSAL</div>
                </div>
              )}

              {/* Subject Node Card */}
              <div className={`${cardBg} ${cardText} px-3 py-1.5 rounded-sm shadow-md border ${cardBorder} flex items-center gap-2`}>
                {isVector && <Search className="w-3 h-3" />}
                <span className="font-bold">{step.subject}</span>
              </div>

              {/* The Relation Edge */}
              <div className={`flex items-center ${isVector ? 'text-[#38bdf8]' : 'text-[#C0392B]'}`}>
                <span className={`text-[10px] uppercase tracking-tighter ${relationBg} px-1 rounded-sm`}>
                  {step.relation || 'CONNECTED_TO'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
              
              {/* Object Node Card (only render on the last step, or if the next step has a different subject) */}
              {(index === trail.length - 1 || trail[index+1]?.subject !== step.object) && (
                <motion.div 
                  className={`bg-[#F5EDD4] text-[#1A1108] px-3 py-1.5 rounded-sm shadow-md border border-[#8B6914] flex items-center gap-2`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.4 + 0.2, duration: 0.4 }}
                >
                  <span className="font-bold">{step.object}</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
