import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { FULL_RANGE, type Range } from '@/lib/range';
import { loadRange, saveRange } from '@/lib/storage';

type RangeContextValue = {
  range: Range;
  setRange: (r: Range) => void;
  /** False until the stored range has been read back. */
  hydrated: boolean;
};

const RangeContext = createContext<RangeContextValue | null>(null);

export function RangeProvider({ children }: { children: ReactNode }) {
  const [range, setRangeState] = useState<Range>(FULL_RANGE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRange().then((r) => {
      if (cancelled) return;
      setRangeState(r);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Write-through: state updates immediately, storage catches up.
  const setRange = useCallback((r: Range) => {
    setRangeState(r);
    void saveRange(r);
  }, []);

  return (
    <RangeContext.Provider value={{ range, setRange, hydrated }}>{children}</RangeContext.Provider>
  );
}

export function useRange(): RangeContextValue {
  const ctx = useContext(RangeContext);
  if (!ctx) throw new Error('useRange must be used inside a RangeProvider');
  return ctx;
}
