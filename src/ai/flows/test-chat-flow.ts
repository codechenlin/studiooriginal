
'use server';

/**
 * @fileoverview A simple flow for testing chat functionality with DeepSeek.
 */
import { deepseekChat } from '@/ai/deepseek';

interface TestChatConfig {
    apiKey: string;
    model: string;
}

export async function testChat(prompt: string, config: TestChatConfig): Promise<string> {
  // Directly call the deepseekChat function without using a Genkit flow
  return await deepseekChat(prompt, config);
}
