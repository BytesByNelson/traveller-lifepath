/**
 * GM dice-override: a session-local queue of forced "natural" roll values.
 * When enabled and the queue is non-empty, the next user-triggered roll in
 * HybridDice consumes from the queue instead of calling the RNG.
 *
 * Use cases:
 *  - GMs testing "what happens if survival rolls a 3?"
 *  - Reproducing a bug report exactly without seeding RNG plumbing
 *  - Forcing a specific outcome at the table when the GM has a narrative beat
 *
 * NOT persisted — cleared on page reload. This is a debug / GM testing
 * affordance, not a save state.
 */
type Listener = () => void;

let enabled = false;
let queue: number[] = [];
const listeners = new Set<Listener>();

const emit = (): void => {
  for (const l of listeners) l();
};

export const gmOverride = {
  isEnabled: (): boolean => enabled,
  setEnabled: (next: boolean): void => {
    if (enabled === next) return;
    enabled = next;
    if (!enabled) queue = [];
    emit();
  },
  getQueue: (): readonly number[] => queue,
  /** Append values onto the queue. Non-integer / out-of-range values are dropped. */
  enqueue: (values: number[]): void => {
    const clean = values.filter((v) => Number.isFinite(v) && Number.isInteger(v));
    if (clean.length === 0) return;
    queue = [...queue, ...clean];
    emit();
  },
  /** Pop the head value. Returns undefined when disabled or empty. */
  consume: (): number | undefined => {
    if (!enabled || queue.length === 0) return undefined;
    const v = queue[0]!;
    queue = queue.slice(1);
    emit();
    return v;
  },
  clear: (): void => {
    if (queue.length === 0) return;
    queue = [];
    emit();
  },
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Test-only escape hatch — resets the whole module to a clean state. */
  __reset: (): void => {
    enabled = false;
    queue = [];
    emit();
  },
};
