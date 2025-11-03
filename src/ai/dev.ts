
import { config } from 'dotenv';
config();

import '@/ai/flows/email-campaign-insights.ts';
import '@/ai/flows/dns-verification-flow.ts';
import '@/ai/flows/send-test-email-flow.ts';
import '@/ai/flows/dkim-generation-flow.ts';
import '@/ai/flows/smtp-error-analysis-flow.ts';
import '@/ai/flows/spam-checker-flow.ts';
import '@/ai/flows/virus-scan-flow.ts';
import '@/ai/flows/test-chat-flow.ts';
import '@/ai/flows/api-health-check-flow.ts';
import '@/ai/flows/vmc-deepseek-analysis-flow.ts';


