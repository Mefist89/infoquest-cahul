export type SignalProgress = {
  found: ReadonlySet<string>;
  trapClicks: number;
  trapIds: ReadonlySet<string>;
  lastTrap: string | null;
};

export function createSignalProgress(): SignalProgress {
  return { found: new Set(), trapClicks: 0, trapIds: new Set(), lastTrap: null };
}

export function recordSignalClick(progress: SignalProgress, id: string, signalIds: readonly string[], normalIds: readonly string[]): SignalProgress {
  if (normalIds.includes(id)) return {
    ...progress, trapClicks: progress.trapClicks + 1, trapIds: new Set(progress.trapIds).add(id), lastTrap: id,
  };
  if (!signalIds.includes(id) || progress.found.has(id)) return progress;
  return { ...progress, found: new Set(progress.found).add(id), lastTrap: null };
}

export function retrySignalProgress(progress: SignalProgress): SignalProgress {
  return { ...createSignalProgress(), found: progress.found };
}

export function evaluateSignalSelection(progress: SignalProgress, signalIds: readonly string[]) {
  const correct = signalIds.filter(id => progress.found.has(id)).length;
  const valid = [...progress.found].every(id => signalIds.includes(id));
  return {
    correct, total: signalIds.length, trapClicks: progress.trapClicks,
    passed: signalIds.length > 0 && correct === signalIds.length && progress.trapClicks <= 2 && valid,
  };
}
