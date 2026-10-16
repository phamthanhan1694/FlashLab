import type { Card } from '@flashlab/shared';
export type MemoryFilter = 'all' | 'remembered' | 'unremembered';
export function matchesMemoryFilter(
  card: Pick<Card, 'remembered'> | undefined,
  filter: MemoryFilter,
) {
  if (!card) return false;
  return (
    filter === 'all' ||
    (filter === 'remembered'
      ? card.remembered === true
      : card.remembered !== true)
  );
}
