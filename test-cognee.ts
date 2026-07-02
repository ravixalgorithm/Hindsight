import { config } from 'dotenv';

config();

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'https://api.cognee.ai/api/v1';
const COGNEE_API_KEY = process.env.COGNEE_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': COGNEE_API_KEY,
} as any;

async function test() {
  console.log('Testing POST /cognify with JSON...');
  const cognifyRes = await fetch(`${COGNEE_API_URL}/cognify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ datasets: ["detective_mode"] })
  });
  console.log(cognifyRes.status, await cognifyRes.text());
}

test().catch(console.error);
