import { createCogneeClient } from 'cognee-vercel-ai-sdk';

const client = createCogneeClient({
  baseURL: "http://localhost:8000/api/v1",
  apiKey: "test",
});
console.log(Object.keys(client));
