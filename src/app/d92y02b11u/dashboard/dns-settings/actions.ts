
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const configPath = path.join(process.cwd(), 'src', 'app', 'lib', 'dns-config.json');

const DnsConfigSchema = z.object({
  spfIncludeDomain: z.string(),
  mxTargetDomain: z.string(),
  dkimSelector: z.string(),
  bimiSelector: z.string(),
});

export type DnsConfig = z.infer<typeof DnsConfigSchema>;

async function readDnsConfig(): Promise<DnsConfig> {
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8');
    return DnsConfigSchema.parse(JSON.parse(fileContent));
  } catch (error) {
    console.error("Failed to read dns-config.json, returning default. Error:", error);
    return {
      spfIncludeDomain: '_spf.daybuu.com',
      mxTargetDomain: 'daybuu.com',
      dkimSelector: 'daybuu',
      bimiSelector: 'daybuu',
    };
  }
}

async function writeDnsConfig(config: DnsConfig) {
  try {
    const validatedConfig = DnsConfigSchema.parse(config);
    await fs.writeFile(configPath, JSON.stringify(validatedConfig, null, 2), 'utf-8');
  } catch (error: any) {
    console.error("Failed to write to dns-config.json:", error);
    throw new Error('No se pudo guardar el archivo de configuración DNS.');
  }
}

export async function getDnsConfig(): Promise<{ success: boolean, data?: DnsConfig, error?: string }> {
  try {
    const config = await readDnsConfig();
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: 'No se pudo leer la configuración DNS.' };
  }
}

export async function saveDnsConfig(config: DnsConfig): Promise<{ success: boolean, error?: string }> {
  try {
    await writeDnsConfig(config);
    revalidatePath('/d92y02b11u/dashboard/dns-settings', 'page');
    // Revalidate other paths that might use this config
    revalidatePath('/dashboard/servers', 'page');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
