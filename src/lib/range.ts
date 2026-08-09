import type { DomainCore, Ruler } from './domain';

/* Which slice of a domain is in play. Persisted per domain so the choice
 * survives navigation and app restarts, and mirrored into the quiz URL on web
 * (/us/quiz/mixed?range=1-20) so a round stays shareable there.
 *
 * Both domains index on `no`. /us shows those numbers, so a span reads as
 * "#1–#20"; /ru never shows them, so the same span reads as an era name and the
 * chips are the only way to move it. */

export type Range = { lo: number; hi: number };

/** The full span of a domain. Cheap enough to call in render, but the range
 *  picker memoises it because its pan handlers read it per frame. */
export function bounds(domain: DomainCore): Range {
  const nos = domain.records.map((r) => r.no);
  return { lo: Math.min(...nos), hi: Math.max(...nos) };
}

export function clampNo(domain: DomainCore, n: number | string): number {
  const { lo, hi } = bounds(domain);
  const v = Math.round(Number(n));
  if (!isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, v));
}

export function makeRange(domain: DomainCore, lo: number | string, hi: number | string): Range {
  const a = clampNo(domain, lo);
  const b = clampNo(domain, hi);
  return a <= b ? { lo: a, hi: b } : { lo: b, hi: a };
}

/** Domain-free: the URL and storage forms are just two integers. */
export function parseRange(str: string | null | undefined): Range | null {
  const m = /^(\d+)-(\d+)$/.exec(str ?? '');
  return m ? { lo: Number(m[1]), hi: Number(m[2]) } : null;
}

/** Parse and clamp in one step. Use this for anything that arrives from outside
 *  the app — a stored value or a ?range= query param — so a stale span from the
 *  other domain, or a hand-edited URL, cannot select an empty pool. */
export function parseRangeIn(domain: DomainCore, str: string | null | undefined): Range | null {
  const r = parseRange(str);
  return r ? makeRange(domain, r.lo, r.hi) : null;
}

export function rangeSlug(r: Range): string {
  return `${r.lo}-${r.hi}`;
}

/** The readout beside the picker heading. A domain that names its eras finds one
 *  here before falling back to a numeric span. */
export function rangeText(domain: DomainCore, r: Range): string {
  const full = bounds(domain);
  if (r.lo === full.lo && r.hi === full.hi) return domain.strings.rangeAll;
  const preset = domain.presets.find((p) => p.lo === r.lo && p.hi === r.hi);
  return preset ? preset.label : domain.strings.rangeSpan(r.lo, r.hi);
}

export function pool(domain: DomainCore, r: Range): Ruler[] {
  return domain.records.filter((x) => x.no >= r.lo && x.no <= r.hi);
}

export function rangesEqual(a: Range, b: Range): boolean {
  return a.lo === b.lo && a.hi === b.hi;
}
