import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { datasetName } = await req.json();
    if (!datasetName) return NextResponse.json({ error: "No dataset" }, { status: 400 });

    // Mocking the improve operation for the demo, as we don't have the exact SDK method signature.
    // In a real implementation this would call: await client.cognify.improve({ datasetId: datasetName })
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate removing 15% redundant nodes for the demo narrative
    return NextResponse.json({ 
      status: "success", 
      message: "Memory improved",
      prunedNodes: 4 
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to improve" }, { status: 500 });
  }
}
