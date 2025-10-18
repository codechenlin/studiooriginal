
'use server';
/**
 * @fileOverview A flow to check the health of the external VMC Validator API.
 *
 * - checkApiHealth - A function that calls the /health endpoint of the API.
 * - ApiHealthOutput - The return type for the checkApiHealth function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import https from 'https';

const API_BASE = "https://8b3i4m6i39303g2k432u.fanton.cloud";
const API_KEY = process.env.VMC_VALIDATOR_API_KEY;

const ApiHealthOutputSchema = z.object({
  status: z.string(),
});
export type ApiHealthOutput = z.infer<typeof ApiHealthOutputSchema>;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

export async function checkApiHealth(): Promise<ApiHealthOutput> {
  if (!API_KEY) {
    throw new Error('VMC Validator API key is not configured.');
  }

  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
      agent: API_BASE.startsWith('https') ? httpsAgent : undefined,
    });

    if (!response.ok) {
      throw new Error(`API returned an error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return ApiHealthOutputSchema.parse(result);

  } catch (error: any) {
    console.error('Failed to connect to VMC API:', error);
    throw new Error(`Failed to connect to VMC API: ${error.message}`);
  }
}
