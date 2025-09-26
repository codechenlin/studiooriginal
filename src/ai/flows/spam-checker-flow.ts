
'use server';
/**
 * @fileOverview A flow to check if a given text is spam using the APILayer Spamchecker API.
 *
 * - checkSpam - A function that handles the spam checking process.
 * - SpamCheckerInput - The input type for the checkSpam function.
 * - SpamCheckerOutput - The return type for the checkSpam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpamCheckerInputSchema = z.object({
  text: z.string().describe('The text content to be analyzed for spam.'),
  threshold: z.number().min(1).max(10).optional().default(5.0).describe('The spam score threshold. Default is 5.0.'),
});
export type SpamCheckerInput = z.infer<typeof SpamCheckerInputSchema>;

const SpamCheckerOutputSchema = z.object({
  is_spam: z.boolean(),
  result: z.string(),
  score: z.number(),
  text: z.string(),
});
export type SpamCheckerOutput = z.infer<typeof SpamCheckerOutputSchema>;

export async function checkSpam(
  input: SpamCheckerInput
): Promise<SpamCheckerOutput> {
  return spamCheckerFlow(input);
}

const spamCheckerFlow = ai.defineFlow(
  {
    name: 'spamCheckerFlow',
    inputSchema: SpamCheckerInputSchema,
    outputSchema: SpamCheckerOutputSchema,
  },
  async ({ text, threshold }) => {
    const apiKey = process.env.SPAM_CHECKER_API_KEY;

    if (!apiKey) {
      throw new Error('SPAM_CHECKER_API_KEY is not defined in environment variables.');
    }

    const headers = new Headers();
    headers.append("apikey", apiKey);

    const requestOptions = {
      method: 'POST',
      redirect: 'follow' as RequestRedirect,
      headers: headers,
      body: text,
    };
    
    const url = `https://api.apilayer.com/spamchecker?threshold=${threshold}`;

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = { message: await response.text() };
        }
        
        switch (response.status) {
            case 400:
                throw new Error(`Bad Request: ${errorBody.message || 'Missing required parameter.'}`);
            case 401:
                throw new Error(`Unauthorized: ${errorBody.message || 'Invalid API key.'}`);
            case 429:
                throw new Error(`Rate Limit Exceeded: ${errorBody.message || 'You have exceeded your API rate limit.'}`);
            default:
                throw new Error(`API Error (${response.status}): ${errorBody.message || 'An unknown error occurred.'}`);
        }
      }

      const result: SpamCheckerOutput = await response.json();
      return result;

    } catch (error: any) {
      console.error('Spam Checker API call failed:', error);
      throw new Error(`Failed to check for spam: ${error.message}`);
    }
  }
);
