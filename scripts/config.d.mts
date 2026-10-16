import type { Preferences } from '@flashlab/shared';
export interface AppConfig {
  server: {
    host: string;
    apiPort: number;
    webPort: number;
    portSearchLimit: number;
  };
  storage: { directory: string; legacyDataFile: string };
  study: {
    autoAdvanceSeconds: number;
    completionPercent: number;
    historyPageSize: number;
    testQuestionLimit: number;
    matchPairLimit: number;
  };
  defaults: Preferences;
}
export const projectRoot: string;
export function loadConfig(): AppConfig;
export function storagePath(value: string): string;
export function publicConfig(
  config: AppConfig,
): Pick<AppConfig, 'study' | 'defaults'>;
export function findFreePort(
  start: number,
  host: string,
  limit: number,
  excluded?: number[],
): Promise<number>;
