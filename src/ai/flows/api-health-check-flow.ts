
'use server';
/**
 * @fileOverview A flow to check the health of the external VMC Validator API.
 *
 * - checkApiHealth - A function that calls the /health endpoint of the API.
 * - ApiHealthOutput - The return type for the checkApiHealth function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const API_BASE = "https://8b3i4m6i39303g2k432u.fanton.cloud";
const API_KEY = "6783434hfsnjd7942074nofsbs6472930nfns629df0983jvnmkd32";

const ApiHealthOutputSchema = z.object({
  status: z.string(),
});
export type ApiHealthOutput = z.infer<typeof ApiHealthOutputSchema>;

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
    });

    if (!response.ok) {
       const errorBody = await response.text();
       console.error(`API Error: ${response.status}`, errorBody);
       throw new Error(`API returned an error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
    }
    
    const result = await response.json();
    return ApiHealthOutputSchema.parse(result);

  } catch (error: any) {
    console.error('Failed to connect to VMC API:', error);
    throw new Error(`Failed to connect to VMC API: ${error.message}`);
  }
}
