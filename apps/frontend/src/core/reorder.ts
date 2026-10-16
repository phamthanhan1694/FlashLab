/** Move one entry around another without changing the relative order of other entries. */
export function reorderItems<T extends { id: string }>(
  items: readonly T[],
  source: string,
  target: string,
  after = false,
): T[] {
  if (
    source === target ||
    !items.some((item) => item.id === source) ||
    !items.some((item) => item.id === target)
  )
    return [...items];
  const moving = items.find((item) => item.id === source)!;
  const next = items.filter((item) => item.id !== source);
  const index = next.findIndex((item) => item.id === target);
  next.splice(index + (after ? 1 : 0), 0, moving);
  return next;
}
