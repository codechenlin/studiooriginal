
'use server';

import { checkApiHealth, type ApiHealthOutput } from '@/ai/flows/api-health-check-flow';
import { validateVmcWithApi } from '@/ai/flows/vmc-validator-api-flow';
import { type VmcApiValidationInput, type VmcApiValidationOutput } from '@/ai/flows/vmc-validator-api-types';

export async function checkApiHealthAction() {
  try {
    const result = await checkApiHealth();
    if (result.status === 'ok') {
        return { success: true, data: result };
    }
    return { success: false, error: `API returned status: ${result.status}` };
  } catch (error: any) {
    console.error('API health check action error:', error);
    return { success: false, error: error.message };
  }
}

export async function validateVmcWithApiAction(input: VmcApiValidationInput): Promise<{ success: boolean; data?: VmcApiValidationOutput; error?: string }> {
  try {
    const result = await validateVmcWithApi(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('VMC validation action error:', error);
    return { success: false, error: error.message };
  }
}
