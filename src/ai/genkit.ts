
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import fs from 'fs';
import path from 'path';

// Note: The Deepseek plugin is now a direct API client and is not a Genkit plugin anymore.
// It will be called directly from the flows that need it, based on the config file.

interface AiConfig {
    provider: 'google' | 'deepseek';
    apiKey: string;
    modelName: string;
    enabled: boolean;
    functions: {
        dnsAnalysis: boolean;
    };
}

let aiConfig: AiConfig | null = null;

try {
    const configPath = path.join(process.cwd(), 'src', 'app', 'lib', 'ai-config.json');
    if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        aiConfig = JSON.parse(configFile);
    }
} catch (error) {
    console.warn("Could not read or parse ai-config.json. AI features will be disabled.", error);
}

const plugins = [];

// Keep Google AI plugin for any flows that might still use it or for future use.
if (process.env.GEMINI_API_KEY) {
    plugins.push(googleAI());
}

let model = 'googleai/gemini-1.5-flash-latest'; // Default model remains Google's

// The logic to select the model will now live inside each flow,
// checking the aiConfig directly.

export const ai = genkit({
  plugins,
  model,
});

export function isDnsAnalysisEnabled() {
    return aiConfig?.enabled && aiConfig.functions?.dnsAnalysis;
}

export function getAiConfigForFlows() {
    return aiConfig;
}
