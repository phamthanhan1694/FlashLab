import { fetchRead } from './http';
import { publicConfigSchema, type PublicConfig } from '@flashlab/shared';
declare const __FLASHLAB_CONFIG__: PublicConfig;
export let runtimeConfig = __FLASHLAB_CONFIG__;
export async function initializeRuntimeConfig() {
  try {
    const response = await fetchRead('/api/config', 3000);
    if (!response.ok) return;
    const parsed = publicConfigSchema.safeParse(await response.json());
    if (parsed.success) runtimeConfig = parsed.data;
  } catch {
    /* Offline mode uses the configuration embedded at build time. */
  }
}
