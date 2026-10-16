import { rm } from 'node:fs/promises';
// These directories contain generated output only, never profile data or source assets.
for (const path of [
  '../packages/shared/dist',
  '../apps/backend/dist',
  '../apps/frontend/dist',
]) {
  await rm(new URL(path, import.meta.url), { recursive: true, force: true });
}
