/**
 * Pure, clock-injected delay queue. No timers inside: callers pass `nowMs`.
 * Used by apps/api (rooms) and apps/web (solo-mode NPC Mission Control).
 */
export interface QueuedItem<T> {
  deliverAtMs: number;
  item: T;
}

export function computeDeliverAtMs(
  sentAtMs: number,
  lightTimeSeconds: number,
  timeScale: number,
  linkRestoredAtMs?: number | null,
): number {
  const base = sentAtMs + lightTimeSeconds * timeScale * 1000;
  return linkRestoredAtMs != null ? Math.max(base, linkRestoredAtMs) : base;
}

export class DelayedQueue<T> {
  private items: QueuedItem<T>[] = [];

  get size(): number {
    return this.items.length;
  }

  enqueue(item: T, deliverAtMs: number): void {
    this.items.push({ item, deliverAtMs });
    this.items.sort((a, b) => a.deliverAtMs - b.deliverAtMs);
  }

  /** Remove and return every item due at or before `nowMs`, oldest first. */
  drain(nowMs: number): T[] {
    const due: T[] = [];
    while (this.items.length > 0 && this.items[0]!.deliverAtMs <= nowMs) {
      due.push(this.items.shift()!.item);
    }
    return due;
  }

  /** Earliest scheduled delivery time, or null when empty. */
  nextDueAtMs(): number | null {
    return this.items[0]?.deliverAtMs ?? null;
  }

  /** Link outage: nothing is delivered before `restoredAtMs`. */
  holdUntil(restoredAtMs: number): void {
    for (const q of this.items) q.deliverAtMs = Math.max(q.deliverAtMs, restoredAtMs);
    this.items.sort((a, b) => a.deliverAtMs - b.deliverAtMs);
  }

  /** For persistence / rescheduling after a restart. */
  snapshot(): QueuedItem<T>[] {
    return this.items.map((q) => ({ ...q }));
  }
}
