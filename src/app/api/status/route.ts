import { NextRequest, NextResponse } from "next/server";
import { getApiUrl, getHeaders } from "@/lib/cognee/client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const datasetName = url.searchParams.get("dataset");

  if (!datasetName) {
    return NextResponse.json({ error: "Dataset name is required" }, { status: 400 });
  }

  try {
    // Try v1.1.3+ status endpoint first
    const res = await fetch(`${getApiUrl()}/datasets/status`, {
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'completed') return NextResponse.json({ status: 'done' });
      if (data.status === 'error') return NextResponse.json({ status: 'error' });
      return NextResponse.json({ status: 'processing' });
    }
  } catch (error) {}

  // Fallback: check if dataset exists in list
  try {
    const res = await fetch(`${getApiUrl()}/datasets`, {
      headers: getHeaders(),
    });
    if (res.ok) {
      const datasets = await res.json();
      const exists = datasets.some((d: any) => d.name === datasetName);
      if (exists) {
        return NextResponse.json({ status: 'done' });
      }
    }
  } catch (error) {}
  
  return NextResponse.json({ status: 'processing' });
}
