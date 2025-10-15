
/**
 * @fileoverview A Genkit plugin for DeepSeek models.
 */
'use strict';

import {
  definePlugin,
  type Plugin,
  type ModelAction,
  GenerateRequest,
  Part,
  ToolRequest,
  GenerationCommon,
  Candidate,
  finishReason,
  mediaType,
  Role,
} from 'genkit';
import { z } from 'zod';

const DeepSeekConfigSchema = z.object({
  apiKey: z.string(),
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

function toDeepSeekMessages(
  request: GenerateRequest
): {
  system?: string;
  messages: DeepSeekMessage[];
} {
  let system: string | undefined = undefined;
  if (request.config?.systemPrompt) {
    throw new Error('systemPrompt is not supported, use messages instead.');
  }

  const messages: DeepSeekMessage[] = [];
  for (const message of request.messages) {
    if (message.role === 'system') {
      system = message.content[0].text;
      continue;
    }
    const msg: DeepSeekMessage = {
      role: message.role,
      content: message.content[0].text || '',
    };
    messages.push(msg);
  }
  return { system, messages };
}

function fromDeepSeekResponse(response: DeepSeekResponse): Candidate[] {
  return response.choices.map((choice) => {
    const candidate: Candidate = {
      index: choice.index,
      finishReason: finishReason(choice.finish_reason) || 'other',
      message: {
        role: 'assistant',
        content: [{ text: choice.message.content }],
      },
    };
    return candidate;
  });
}

async function deepseekGenerate(
  request: GenerateRequest,
  config: DeepSeekConfig
): Promise<GenerationCommon> {
  const modelName = request.model.name;
  if (!modelName.startsWith('deepseek/')) {
    throw new Error(`Not a DeepSeek model: ${request.model.name}`);
  }

  const { messages } = toDeepSeekMessages(request);

  const req: DeepSeekRequest = {
    model: modelName.substring('deepseek/'.length),
    messages: messages,
    stream: false,
  };

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`DeepSeek error: ${response.status} ${errBody}`);
  }

  const deepseekResponse: DeepSeekResponse = await response.json();
  const candidates = fromDeepSeekResponse(deepseekResponse);
  return { candidates };
}

export const deepseekPlugin: Plugin<[DeepSeekConfig] | []> = definePlugin(
  {
    name: 'deepseek',
    configSchema: DeepSeekConfigSchema,
  },
  async (config) => {
    const model: ModelAction = (req, streaming) => {
      // All `deepseek/...` models will be handled by this function.
      return deepseekGenerate(req, config);
    };

    return {
      models: [
        {
          name: 'deepseek-chat', // This is a default/example, the actual name is dynamic
          // We can use a wildcard or a more dynamic registration if Genkit supports it,
          // but for now we rely on the string format `deepseek/model-name`
          action: model,
        },
      ],
      // This informs Genkit that any model starting with `deepseek/` should use our plugin.
      onFirstRequest: (modelRef) => {
        if (modelRef.provider === 'deepseek') {
            return {
                model: {
                    name: modelRef.name,
                    action: model,
                }
            }
        }
      }
    };
  }
);

export default deepseekPlugin;
