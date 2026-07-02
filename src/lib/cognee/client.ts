import { createCogneeClient } from "cognee-vercel-ai-sdk";

// Helper for raw REST calls not covered by the SDK (like graph fetching, datasets list, deletion)
export const getApiUrl = () => process.env.COGNEE_API_URL || "https://api.cognee.ai/api/v1";

export function getHeaders(isFormData: boolean = false) {
  const headers: any = {
    "X-Api-Key": process.env.COGNEE_API_KEY || "",
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (process.env.COGNEE_TENANT_ID) {
    headers["Tenant-Id"] = process.env.COGNEE_TENANT_ID; 
  }
  
  if (process.env.COGNEE_USER_ID) {
    headers["User-Id"] = process.env.COGNEE_USER_ID; 
  }
  
  return headers;
}

// SDK Client Singleton
let sdkClient: any = null;
export async function getCognee() {
  if (!sdkClient) {
    sdkClient = await createCogneeClient({
      apiKey: process.env.COGNEE_API_KEY || "",
      baseURL: process.env.COGNEE_API_URL || "https://api.cognee.ai/api/v1",
      headers: getHeaders(false),
    });
  }
  return sdkClient;
}

export async function addData(datasetId: string, data: any[]) {
  const rawText = data.map(item => {
    if (typeof item === 'string') return item;
    if (item.content) return item.content;
    if (item.text) return item.text;
    return JSON.stringify(item);
  }).join("\n\n---\n\n");

  const formData = new FormData();
  formData.append("datasetName", datasetId);
  formData.append("data", new Blob([rawText], { type: "text/plain" }), "payload.txt");

  const res = await fetch(`${getApiUrl()}/add`, {
    method: "POST",
    headers: getHeaders(true),
    body: formData
  });

  if (!res.ok) throw new Error(`Failed to add data: ${await res.text()}`);
  return res.json();
}

export async function cognify(datasetId: string, runInBackground: boolean = false, customPrompt?: string) {
  const payload: any = {
    datasets: [datasetId],
    runInBackground
  };
  if (customPrompt) payload.customPrompt = customPrompt;
  
  const promise = fetch(`${getApiUrl()}/cognify`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(payload)
  });
  
  if (runInBackground) {
    promise.catch((e: any) => console.error("Background cognify failed:", e));
    return { status: "processing" };
  }
  
  const res = await promise;
  if (!res.ok) throw new Error(`Failed to cognify: ${await res.text()}`);
  return res.json();
}

export async function getDatasetGraph(datasetId: string) {
  let uuid = datasetId;
  try {
    const dRes = await fetch(`${getApiUrl()}/datasets`, { headers: getHeaders() });
    if (dRes.ok) {
      const datasets = await dRes.json();
      const ds = datasets.find((d: any) => d.name === datasetId);
      if (ds) uuid = ds.id;
    }
  } catch (e) {
    console.error("Failed to resolve dataset ID", e);
  }

  const res = await fetch(`${getApiUrl()}/datasets/${uuid}/graph`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch graph from Cognee");
  return res.json();
}

export async function search(datasetId: string, query: string, searchType: string, options: any = {}) {
  const payload: any = {
    query,
    datasets: [datasetId],
    searchType,
    topK: options.topK || 5,
  };
  if (options.systemPrompt) payload.systemPrompt = options.systemPrompt;
  
  const res = await fetch(`${getApiUrl()}/search`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) throw new Error(`Search failed: ${await res.text()}`);
  return res.json();
}

export async function deleteDataset(datasetId: string) {
  let uuid = datasetId;
  try {
    const dRes = await fetch(`${getApiUrl()}/datasets`, { headers: getHeaders() });
    if (dRes.ok) {
      const datasets = await dRes.json();
      const ds = datasets.find((d: any) => d.name === datasetId);
      if (ds) uuid = ds.id;
    }
  } catch (e) {
    console.error("Failed to resolve dataset ID", e);
  }

  const res = await fetch(`${getApiUrl()}/datasets/${uuid}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.ok;
}
