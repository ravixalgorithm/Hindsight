import { config } from 'dotenv';

config();

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'https://api.cognee.ai/api/v1';
const COGNEE_API_KEY = process.env.COGNEE_API_KEY;

const getHeaders = (isFormData = false) => {
  const headers = { 'X-Api-Key': COGNEE_API_KEY } as any;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

async function testPipeline() {
  try {
    const dataset = "detective";
    console.log("1. Adding data...");
    const formData = new FormData();
    formData.append("datasetName", dataset);
    formData.append("data", new Blob([JSON.stringify([{
      text: "Doug was last seen at the casino."
    }])], { type: "application/json" }), "data.json");
    
    await fetch(`${COGNEE_API_URL}/add`, { method: "POST", headers: getHeaders(true), body: formData });
    
    console.log("2. Cognifying...");
    await fetch(`${COGNEE_API_URL}/cognify`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ datasets: [dataset] }) });
    
    console.log("3. Resolving Dataset ID...");
    const dRes = await fetch(`${COGNEE_API_URL}/datasets`, { headers: getHeaders() });
    const datasets = await dRes.json();
    const ds = datasets.find((d: any) => d.name === dataset);
    
    if (!ds) throw new Error("Dataset not found after cognify");
    
    console.log("4. Fetching Graph...");
    const gRes = await fetch(`${COGNEE_API_URL}/datasets/${ds.id}/graph`, { headers: getHeaders() });
    const graphStr = await gRes.text();
    console.log(graphStr.substring(0, 1000));
  } catch(e) {
    console.error(e);
  }
}

testPipeline();
