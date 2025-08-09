"use server";

import { generateEmailCampaignInsights, type EmailCampaignInsightsInput } from "@/ai/flows/email-campaign-insights";
import { z } from "zod";

const actionSchema = z.object({
  emailAnalyticsData: z.string(),
});

export async function getCampaignInsightsAction(input: EmailCampaignInsightsInput) {
  try {
    const validatedInput = actionSchema.parse(input);
    const result = await generateEmailCampaignInsights(validatedInput);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: errorMessage };
  }
}
