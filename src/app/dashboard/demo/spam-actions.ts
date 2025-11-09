'use server';

import {
  SpamAssassinInputSchema,
  SpamAssassinOutputSchema,
  type SpamAssassinInput,
  type SpamAssassinOutput,
} from '@/ai/flows/spam-assassin-types';
import { z } from 'zod';

const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9002/api/spam-assassin' // Adjust if your local port is different
  : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/spam-assassin`;


export async function healthCheckSpamAssassin(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_URL}`, { method: 'GET' });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Fallo en la verificación de estado.');
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Health check action error:', error);
    return { success: false, error: error.message };
  }
}

const actionSchema = SpamAssassinInputSchema;

export async function classifyWithSpamAssassin(input: SpamAssassinInput): Promise<{ success: boolean; data?: SpamAssassinOutput; error?: string }> {
  try {
    const validatedInput = actionSchema.parse(input);
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedInput),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Falló la clasificación de spam.');
    }

    const validatedOutput = SpamAssassinOutputSchema.parse(data);
    return { success: true, data: validatedOutput };

  } catch (error: any) {
    console.error('Spam classification action error:', error);
    if (error instanceof z.ZodError) {
        return { success: false, error: `Error de validación: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, error: error.message };
  }
}
