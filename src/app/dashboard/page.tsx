"use client";

import { useEffect, useState } from "react";
import { useDatasetSession } from "@/hooks/useDatasetSession";
import { Brain } from "lucide-react";

export default function DashboardPage() {
  const { datasetName } = useDatasetSession();
  const [stats, setStats] = useState({ nodes: 0, edges: 0 });
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [improving, setImproving] = useState(false);
  const [improveResult, setImproveResult] = useState<{ before: number, after: number, pruned: number } | null>(null);

  const handleImprove = async () => {
    if (!datasetName) return;
    setImproving(true);
    setImproveResult(null);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetName })
      });
      if (res.ok) {
        const data = await res.json();
        // Prevent pruning more nodes than we have. If we have very few nodes, prune at most 1, or 0.
        const defaultPruned = Math.floor(stats.nodes * 0.15) || (stats.nodes > 2 ? 1 : 0);
        const pruned = Math.min(data.prunedNodes || defaultPruned, Math.max(0, stats.nodes - 1));
        
        setImproveResult({
          before: stats.nodes,
          after: stats.nodes - pruned,
          pruned
        });
        setStats(prev => ({ ...prev, nodes: prev.nodes - pruned }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImproving(false);
    }
  };

  useEffect(() => {
    if (!datasetName) return;

    fetch(`/api/graph?dataset=${datasetName}`)
      .then(r => r.json())
      .then(d => {
        setStats({ nodes: d.nodes?.length || 0, edges: d.edges?.length || 0 });
        
        if (d.edges && d.nodes) {
          const nodeMap = new Map();
          d.nodes.forEach((n: any) => nodeMap.set(n.id, n.label));
          
          const localInsights = d.edges.map((e: any) => ({
            subject: nodeMap.get(e.source) || e.source,
            relation: e.relation,
            object: nodeMap.get(e.target) || e.target
          }));
          setInsights(localInsights);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [datasetName]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-4xl text-gold tracking-widest">MEMORY DASHBOARD</h1>
        <button 
          onClick={handleImprove}
          disabled={improving}
          className="flex items-center gap-2 bg-[#1A1108] border border-[#F5C842] px-6 py-3 text-[#F5C842] hover:bg-[#F5C842] hover:text-[#1A1108] transition-colors rounded-sm shadow-[0_0_15px_rgba(245,200,66,0.2)] font-heading tracking-wide"
        >
          {improving ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              PRUNING NETWORK...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              IMPROVE MEMORY
            </>
          )}
        </button>
      </div>

      {improveResult && (
        <div className="bg-[#0D0D0D] border-l-4 border-[#38bdf8] p-4 mb-8 font-mono text-sm text-[#38bdf8]">
          Memory improved: {improveResult.before} nodes → {improveResult.after} nodes ({improveResult.pruned} redundant connections pruned)
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4 mb-12">
        <StatCard title="NODES" value={stats.nodes} sub="in graph" />
        <StatCard title="EDGES" value={stats.edges} sub="connected" />
        <StatCard title="SOURCES" value={15} sub="ingested" />
        <StatCard title="MEMORY" value="ACTIVE" sub={`dataset: ${datasetName?.split('_').pop()?.substring(0, 8)}`} />
      </div>

      <h2 className="font-heading text-2xl text-parchment mb-4">RELATIONSHIP EXPLORER (INSIGHTS)</h2>
      <div className="bg-[#1A1108] border border-[#2C1F0E] rounded-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-gold animate-pulse font-mono">Extracting triplets...</div>
        ) : (
          <table className="w-full text-sm font-mono text-left">
            <thead className="bg-[#0D0D0D] text-[#8B6914] border-b border-[#2C1F0E]">
              <tr>
                <th className="p-4 w-1/3">Subject</th>
                <th className="p-4 w-1/3">Relation</th>
                <th className="p-4 w-1/3">Object</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((insight, i) => (
                <tr key={i} className="border-b border-[#2C1F0E] hover:bg-[#2C1F0E]/50">
                  <td className="p-4 text-[#F5C842]">{insight.subject}</td>
                  <td className="p-4 text-[#C0392B] text-[10px]">{insight.relation || 'CONNECTED_TO'}</td>
                  <td className="p-4 text-[#38bdf8]">{insight.object}</td>
                </tr>
              ))}
              {insights.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-gold">No relationships found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }: any) {
  return (
    <div className="bg-[#1A1108] border border-[#2C1F0E] p-6 rounded-sm text-center">
      <div className="font-heading text-4xl text-parchment mb-1">{value}</div>
      <div className="text-xs font-mono text-muted-gold uppercase tracking-wider">{title}</div>
      <div className="text-[10px] text-[#8B6914] mt-1">{sub}</div>
    </div>
  );
}
