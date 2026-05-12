// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { gmOverride } from './gmOverride';

describe('gmOverride singleton', () => {
  beforeEach(() => gmOverride.__reset());

  it('starts disabled with an empty queue', () => {
    expect(gmOverride.isEnabled()).toBe(false);
    expect(gmOverride.getQueue()).toEqual([]);
  });

  it('consume() returns undefined when disabled, even with queued values', () => {
    gmOverride.enqueue([8, 10]);
    expect(gmOverride.consume()).toBeUndefined();
  });

  it('once enabled, consume() pops from the head', () => {
    gmOverride.setEnabled(true);
    gmOverride.enqueue([8, 10, 3]);
    expect(gmOverride.consume()).toBe(8);
    expect(gmOverride.consume()).toBe(10);
    expect(gmOverride.consume()).toBe(3);
    expect(gmOverride.consume()).toBeUndefined();
  });

  it('disabling the override empties the queue', () => {
    gmOverride.setEnabled(true);
    gmOverride.enqueue([7]);
    gmOverride.setEnabled(false);
    expect(gmOverride.getQueue()).toEqual([]);
  });

  it('clear() empties the queue but keeps the enabled state', () => {
    gmOverride.setEnabled(true);
    gmOverride.enqueue([5, 6]);
    gmOverride.clear();
    expect(gmOverride.getQueue()).toEqual([]);
    expect(gmOverride.isEnabled()).toBe(true);
  });

  it('enqueue() drops non-integer values silently', () => {
    gmOverride.setEnabled(true);
    gmOverride.enqueue([8, NaN, 3.5, Infinity, 10]);
    expect(gmOverride.getQueue()).toEqual([8, 10]);
  });

  it('notifies subscribers on enable/disable/enqueue/consume/clear', () => {
    const calls: number[] = [];
    const off = gmOverride.subscribe(() => calls.push(calls.length));
    gmOverride.setEnabled(true);
    gmOverride.enqueue([1, 2]);
    gmOverride.consume();
    gmOverride.clear();
    gmOverride.setEnabled(false);
    expect(calls.length).toBeGreaterThanOrEqual(5);
    off();
  });

  it('unsubscribe stops future notifications', () => {
    let count = 0;
    const off = gmOverride.subscribe(() => count++);
    gmOverride.setEnabled(true);
    const baseline = count;
    off();
    gmOverride.enqueue([4]);
    gmOverride.clear();
    expect(count).toBe(baseline);
  });
});
