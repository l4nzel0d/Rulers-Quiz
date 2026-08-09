import { createContext, useContext, type ReactNode } from 'react';

import type { Domain } from '@/lib/domain';
import { colors } from '@/theme';

/* Which domain the surrounding screens belong to.
 *
 * This is a context rather than a module-level "current domain", and that is
 * load-bearing: static web export renders every route in one Node process, so a
 * mutable global would let /us and /ru bleed into each other's HTML. */

const DomainContext = createContext<Domain | null>(null);

export function DomainProvider({ domain, children }: { domain: Domain; children: ReactNode }) {
  return <DomainContext.Provider value={domain}>{children}</DomainContext.Provider>;
}

/** Every screen under /us and /ru has a domain; asking outside one is a bug. */
export function useDomain(): Domain {
  const ctx = useContext(DomainContext);
  if (!ctx) throw new Error('useDomain must be used inside a DomainProvider');
  return ctx;
}

/** Null at the chooser, which sits above both domains. */
export function useOptionalDomain(): Domain | null {
  return useContext(DomainContext);
}

/** The accent colour in force. Shared components read it from here instead of
 *  `colors.brick`, which every StyleSheet would otherwise bake in at import. */
export function useAccent(): string {
  return useContext(DomainContext)?.accent ?? colors.brick;
}
