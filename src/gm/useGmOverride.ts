import { useSyncExternalStore } from 'react';
import { gmOverride } from './gmOverride';

const getEnabled = () => gmOverride.isEnabled();
const getQueue = () => gmOverride.getQueue();
const fallbackEnabled = () => false;
const fallbackQueue = (): readonly number[] => EMPTY;
const EMPTY: readonly number[] = [];

/** Subscribe to the GM-override singleton state in React. */
export function useGmOverride() {
  const enabled = useSyncExternalStore(gmOverride.subscribe, getEnabled, fallbackEnabled);
  const queue = useSyncExternalStore(gmOverride.subscribe, getQueue, fallbackQueue);
  return {
    enabled,
    queue,
    setEnabled: gmOverride.setEnabled,
    enqueue: gmOverride.enqueue,
    clear: gmOverride.clear,
  };
}
