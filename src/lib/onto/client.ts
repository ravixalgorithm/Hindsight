const ONTO_API_URL = process.env.ONTO_API_URL || "https://api.buildonto.dev";
const ONTO_API_KEY = process.env.ONTO_API_KEY;

export async function readAndScore(url: string) {
  if (!ONTO_API_KEY) {
    throw new Error("ONTO_API_KEY is not configured.");
  }

  const res = await fetch(`${ONTO_API_URL}/read_and_score`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ONTO_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  if (!res.ok) throw new Error("Onto API failed");
  return res.json();
}
