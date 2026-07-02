import { NextResponse, NextRequest } from "next/server";
import { deleteDataset } from "@/lib/cognee/client";
import { DATASET_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dataset = body.datasetName || "detective_core";
    const success = await deleteDataset(dataset);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to delete dataset from Cognee" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
