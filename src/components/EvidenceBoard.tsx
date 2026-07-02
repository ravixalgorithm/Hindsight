"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { motion, useDragControls } from "framer-motion";

export type GraphNode = {
  id: string;
  label: string;
  type: string;
  sourceFragment?: string;
  trust?: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  relation: string;
};

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  onBackgroundClick?: () => void;
  activePathIds?: Set<string>;
  selectedNodeId?: string;
};

function getNodeRotation(nodeId: string): number {
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    hash = ((hash << 5) - hash) + nodeId.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 7) - 3; // -3 to +3 degrees
}

const THEME: any = {
  Person: "#F5C842",
  Place: "#38bdf8",
  Event: "#C0392B",
  Object: "#9ca3af",
  Document: "#8B6914",
  Transaction: "#10b981",
  default: "#2C1F0E",
};

export default function EvidenceBoard({ nodes, edges, onNodeClick, onBackgroundClick, activePathIds, selectedNodeId }: Props) {
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize node positions in a loose grid with randomness
  useEffect(() => {
    if (nodes.length === 0) return;
    if (!containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellW = (width - 200) / cols;
    const cellH = (height - 200) / Math.ceil(nodes.length / cols);
    
    const initialPos: Record<string, { x: number, y: number }> = {};
    nodes.forEach((node, i) => {
      if (nodePositions[node.id]) {
        initialPos[node.id] = nodePositions[node.id];
      } else {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const randX = (Math.random() - 0.5) * 50;
        const randY = (Math.random() - 0.5) * 50;
        initialPos[node.id] = {
          x: 100 + col * cellW + randX,
          y: 100 + row * cellH + randY,
        };
      }
    });
    setNodePositions(initialPos);
  }, [nodes]);

  const handleDrag = (nodeId: string, info: any) => {
    setNodePositions(prev => ({
      ...prev,
      [nodeId]: {
        x: prev[nodeId].x + info.delta.x,
        y: prev[nodeId].y + info.delta.y,
      }
    }));
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#0D0D0D] relative overflow-hidden"
      onClick={onBackgroundClick}
      style={{
        backgroundColor: '#3d2b1f',
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 0px, transparent 50%),
          repeating-linear-gradient(-45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 0px, transparent 50%)
        `,
        backgroundSize: '10px 10px'
      }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map((edge, i) => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];
          if (!sourcePos || !targetPos) return null;
          
          const midX = (sourcePos.x + targetPos.x) / 2;
          const midY = (sourcePos.y + targetPos.y) / 2 - 30; // curve
          
          const isActive = activePathIds?.has(`${edge.source}-${edge.target}`) || activePathIds?.has(`${edge.target}-${edge.source}`);
          const color = isActive ? "#F5C842" : "#C0392B";
          
          return (
            <g key={`edge-${i}`}>
              <motion.path
                d={`M ${sourcePos.x} ${sourcePos.y} Q ${midX} ${midY} ${targetPos.x} ${targetPos.y}`}
                fill="transparent"
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={0.7}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={isActive ? { filter: "drop-shadow(0 0 6px #F5C842)" } : {}}
              />
              <motion.foreignObject 
                x={midX - 50} 
                y={midY - 10} 
                width="100" 
                height="20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.3 }}
              >
                <div className="flex justify-center items-center">
                  <span className="bg-[#C0392B] text-white text-[9px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap border border-black">
                    {edge.relation}
                  </span>
                </div>
              </motion.foreignObject>
            </g>
          );
        })}
      </svg>

      {nodes.map((node, i) => {
        const pos = nodePositions[node.id];
        if (!pos) return null;
        const isSelected = selectedNodeId === node.id;
        
        return (
          <motion.div
            key={node.id}
            drag
            dragMomentum={false}
            onDrag={(e, info) => handleDrag(node.id, info)}
            initial={{ opacity: 0, y: pos.y - 40, x: pos.x }}
            animate={{ opacity: 1, y: pos.y, x: pos.x }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick?.(node);
            }}
            whileHover={{ scale: 1.08, zIndex: 50 }}
            className="absolute -ml-[75px] -mt-[45px] w-[150px] cursor-grab active:cursor-grabbing index-card"
            style={{ rotate: getNodeRotation(node.id) }}
          >
            <div className={`
              bg-[#F5EDD4] shadow-[2px_3px_8px_rgba(0,0,0,0.5)] 
              relative rounded-sm overflow-hidden border
              ${isSelected ? 'border-[#C0392B] border-2 shadow-lg shadow-[#C0392B]/30' : 'border-[#d4c39c] border'}
            `}>
              <div 
                className="h-1.5 w-full" 
                style={{ backgroundColor: THEME[node.type] || THEME.default }}
              />
              
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.8)] border border-black/20" 
                style={{ backgroundColor: THEME[node.type] || THEME.default }} 
              />
              
              <div className="p-2 pt-3 flex flex-col items-center text-center">
                <span 
                  className="text-[10px] font-bold font-heading mb-1 w-full text-center"
                  style={{ color: THEME[node.type] || THEME.default }}
                >
                  📍 {node.type.toUpperCase()}
                </span>
                
                <span className="text-sm font-bold text-[#1A1108] leading-tight font-body">
                  {node.label}
                </span>
                
                {node.sourceFragment && (
                  <span className="mt-2 text-[9px] text-[#8B6914] font-mono">
                    {node.sourceFragment}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-40 bg-[#0D0D0D]/80 backdrop-blur border border-[#2C1F0E] p-4 rounded-sm text-xs font-mono">
        <div className="text-[#F5C842] font-bold mb-2 uppercase tracking-widest border-b border-[#2C1F0E] pb-1">Entity Legend</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(THEME).filter(([k]) => k !== 'default').map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color as string }} />
              <span className="text-[#F5EDD4]/70">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
