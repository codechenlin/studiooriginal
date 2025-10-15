
'use server';

/**
 * @fileoverview A simple client for the DeepSeek API.
 */

import { z } from 'zod';

const DeepSeekConfigSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
});
type DeepSeekConfig = z.infer<typeof DeepSeekConfigSchema>;

interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  stream?: boolean;
}

interface DeepSeekResponse {
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
}

/**
 * Sends a chat prompt to the DeepSeek API.
 * @param prompt The user's prompt.
 * @param config The DeepSeek API configuration.
 * @returns The text response from the model.
 */
export async function deepseekChat(prompt: string, config: DeepSeekConfig): Promise<string> {
  const { apiKey, model } = config;

  if (!apiKey) {
    throw new Error('DeepSeek API key is not provided.');
  }

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: 'You are a helpful assistant. Respond concisely.' },
    { role: 'user', content: prompt },
  ];

  const req: DeepSeekRequest = {
    model: model,
    messages: messages,
  };

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`DeepSeek API Error: ${response.status}`, errorBody);
      throw new Error(`Error con la API de DeepSeek: ${response.statusText}`);
    }

    const deepseekResponse: DeepSeekResponse = await response.json();
    
    if (deepseekResponse.choices && deepseekResponse.choices.length > 0) {
      return deepseekResponse.choices[0].message.content;
    } else {
      throw new Error('La respuesta de la API de DeepSeek no contiene una elección válida.');
    }
  } catch (error: any) {
    console.error('Failed to call DeepSeek API:', error);
    throw new Error(`No se pudo conectar con la API de DeepSeek: ${error.message}`);
  }
}
