import { config } from 'dotenv';
import { search } from './src/lib/cognee/client';

config();

async function testSearch() {
  try {
    const dataset = "detective"; // Or whatever dataset exists
    console.log("Searching GRAPH_COMPLETION...");
    const gRes = await search(dataset, "Where was Doug last seen?", "GRAPH_COMPLETION");
    console.log("Graph:", gRes);
    
    console.log("Searching RAG_COMPLETION...");
    const rRes = await search(dataset, "Where was Doug last seen?", "RAG_COMPLETION");
    console.log("RAG:", rRes);
  } catch (err) {
    console.error(err);
  }
}

testSearch();
