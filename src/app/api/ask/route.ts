import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/cognee/client";
import { DETECTIVE_SYSTEM_PROMPT } from "@/lib/detective/fragments";

const PROMPTS: any = {
  GRAPH_COMPLETION: DETECTIVE_SYSTEM_PROMPT,
  GRAPH_COMPLETION_COT: `You are a meticulous investigator. Think step by step.
    Question each assumption. Show your work. If you find a contradiction, call it out.
    The goal is to find Doug Billings. Every clue matters.`,
  SUMMARIES: `Summarize the evidence as a detective's case briefing. 
    Bullet points. What we know. What we don't. Who was where when.`,
  CHUNKS: undefined,
  INSIGHTS: undefined,
  FEELING_LUCKY: DETECTIVE_SYSTEM_PROMPT
};

export async function POST(req: NextRequest) {
  try {
    const { question, datasetName, searchType = "GRAPH_COMPLETION" } = await req.json();
    const dataset = datasetName || "detective_core";
    
    // Extract synthesized answers directly from Cognee's output
    const extractAnswer = (results: any, isChunks = false) => {
      if (!results) return "No data found.";
      const formatItem = (r: any) => {
        let text = "";
        if (typeof r === 'string') text = r;
        else if (r && r.text) text = r.text;
        else if (r && r.content) text = r.content;
        else text = JSON.stringify(r);

        if (isChunks && text.length > 150) {
          return text.substring(0, 150) + "...";
        }
        return text;
      };

      if (Array.isArray(results)) {
        if (results.length > 0 && results[0].search_result) {
          const sr = Array.isArray(results[0].search_result) ? results[0].search_result : [results[0].search_result];
          return sr.map(formatItem).join("\n");
        }
        return results.map(formatItem).join("\n\n");
      }
      
      if (typeof results === 'object' && results !== null) {
         if (results.search_result) {
            const sr = Array.isArray(results.search_result) ? results.search_result : [results.search_result];
            return sr.map(formatItem).join("\n");
         }
         return formatItem(results);
      }
      
      return "No data found.";
    };

    let actualSearchType = searchType;
    if (searchType === "FEELING_LUCKY") {
      actualSearchType = "SUMMARIES";
    }

    // Parallel searches
    const [graphResults, chunksResults, insightsResults] = await Promise.all([
      search(dataset, question, actualSearchType, { 
        topK: 5, 
        systemPrompt: PROMPTS[actualSearchType] 
      }).catch(() => []),
      search(dataset, question, "CHUNKS", { topK: 3 }).catch(() => []),
      search(dataset, question, "INSIGHTS", { topK: 15 }).catch(() => [])
    ]);
    
    const graphAnswer = extractAnswer(graphResults);
    const chunksAnswer = extractAnswer(chunksResults, true);

    // Option A Traversal Trail extraction
    let trail: any[] = [];
    if (Array.isArray(insightsResults)) {
      trail = insightsResults
        .filter((triplet: any) => {
          if (typeof triplet === 'string') return false; // Not a triplet
          const sub = (triplet.subject || "").toLowerCase();
          const obj = (triplet.object || "").toLowerCase();
          const ans = graphAnswer.toLowerCase();
          return ans.includes(sub) || ans.includes(obj);
        })
        .slice(0, 5); // max 5 hops
    }

    return NextResponse.json({
      vector: { answer: chunksAnswer },
      graph: { answer: graphAnswer, trail, insights: insightsResults, searchTypeUsed: actualSearchType },
      raw: { graphResults, chunksResults }
    });
  } catch (error: any) {
    console.error("Ask error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
