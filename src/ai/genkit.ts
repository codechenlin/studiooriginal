
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
        vmcVerification: boolean;
    };
}

interface DnsConfig {
  spfIncludeDomain: string;
  mxTargetDomain: string;
  dkimSelector: string;
  bimiSelector: string;
}


const aiConfigPath = path.join(process.cwd(), 'src', 'app', 'lib', 'ai-config.json');
const dnsConfigPath = path.join(process.cwd(), 'src', 'app', 'lib', 'dns-config.json');

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

export function getAiConfigForFlows(): AiConfig | null {
    try {
        if (fs.existsSync(aiConfigPath)) {
            const configFile = fs.readFileSync(aiConfigPath, 'utf-8');
            return JSON.parse(configFile) as AiConfig;
        }
        return null;
    } catch (error) {
        console.warn("Could not read or parse ai-config.json for flow.", error);
        return null;
    }
}

export function getDnsConfigForFlows(): DnsConfig {
    try {
        if (fs.existsSync(dnsConfigPath)) {
            const configFile = fs.readFileSync(dnsConfigPath, 'utf-8');
            return JSON.parse(configFile) as DnsConfig;
        }
    } catch (error) {
        console.warn("Could not read or parse dns-config.json for flow, using defaults.", error);
    }
    // Return default config if file doesn't exist or is invalid
    return {
        spfIncludeDomain: '_spf.daybuu.com',
        mxTargetDomain: 'daybuu.com',
        dkimSelector: 'daybuu',
        bimiSelector: 'daybuu',
    };
}
