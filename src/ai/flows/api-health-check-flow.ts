
'use server';
/**
 * @fileOverview A flow to check the health of the external VMC validator API.
 * - checkApiHealth - Calls the /health endpoint to verify connectivity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HealthCheckOutputSchema = z.object({
  status: z.string(),
});
export type HealthCheckOutput = z.infer<typeof HealthCheckOutputSchema>;

const API_BASE = "https://8b3i4m6i39303g2k432u.fanton.cloud";

export async function checkApiHealth(): Promise<HealthCheckOutput> {
  return apiHealthCheckFlow();
}

const apiHealthCheckFlow = ai.defineFlow(
  {
    name: 'apiHealthCheckFlow',
    inputSchema: z.void(),
    outputSchema: HealthCheckOutputSchema,
  },
  async () => {
    const API_KEY = process.env.VMC_VALIDATOR_API_KEY;
    if (!API_KEY) {
      throw new Error('VMC Validator API key is not configured.');
    }

    const headers = { "X-API-KEY": API_KEY, "User-Agent": "MailflowAI-HealthCheck/1.0" };

    try {
      const response = await fetch(`${API_BASE}/health`, { headers });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status} ${response.statusText}`);
      }

      const jsonResponse: HealthCheckOutput = await response.json();
      
      if (jsonResponse.status !== 'ok') {
        throw new Error(`API returned an unhealthy status: ${jsonResponse.status}`);
      }
      
      return jsonResponse;

    } catch (error: any) {
      console.error("VMC Validator API Health Check Error:", error);
      throw new Error(`Failed to connect to VMC API: ${error.message}`);
    }
  }
);
