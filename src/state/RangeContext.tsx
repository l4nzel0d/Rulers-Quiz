import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Domain } from '@/lib/domain';
import { bounds, type Range } from '@/lib/range';
import { loadRange, saveRange } from '@/lib/storage';

type RangeContextValue = {
  range: Range;
  setRange: (r: Range) => void;
  /** False until the stored range has been read back. */
  hydrated: boolean;
};

const RangeContext = createContext<RangeContextValue | null>(null);

/** Mounted per domain, so the two never share a stored range — the same span of
 *  `no` means different centuries on either side. */
export function RangeProvider({ domain, children }: { domain: Domain; children: ReactNode }) {
  const [range, setRangeState] = useState<Range>(() => bounds(domain));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRange(domain).then((r) => {
      if (cancelled) return;
      setRangeState(r);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  // Write-through: state updates immediately, storage catches up.
  const setRange = useCallback(
    (r: Range) => {
      setRangeState(r);
      void saveRange(domain, r);
    },
    [domain]
  );

  // Nothing renders against the wrong range: the subtree waits for the stored
  // one. The domain layout paints its background outside this provider, so the
  // wait shows the domain's own ground rather than a blank frame.
  if (!hydrated) return null;

  return (
    <RangeContext.Provider value={{ range, setRange, hydrated }}>{children}</RangeContext.Provider>
  );
}

export function useRange(): RangeContextValue {
  const ctx = useContext(RangeContext);
  if (!ctx) throw new Error('useRange must be used inside a RangeProvider');
  return ctx;
}
