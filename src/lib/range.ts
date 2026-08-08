import { PRESIDENTS, type President } from '@/data/presidents';

/* Which presidency numbers are in play. Persisted so the choice survives
 * navigation and app restarts, and mirrored into the quiz URL on web
 * (/quiz/mixed?range=1-20) so a round stays shareable there. */

export type Range = { lo: number; hi: number };

export const NO_MIN = Math.min(...PRESIDENTS.map((p) => p.no));
export const NO_MAX = Math.max(...PRESIDENTS.map((p) => p.no));

export const PRESETS: { label: string; lo: number; hi: number }[] = [
  { label: 'All', lo: NO_MIN, hi: NO_MAX },
  { label: 'Founding', lo: 1, hi: 8 },
  { label: '19th c.', lo: 6, hi: 25 },
  { label: 'Modern', lo: 32, hi: NO_MAX },
];

export const FULL_RANGE: Range = { lo: NO_MIN, hi: NO_MAX };

export function clampNo(n: number | string): number {
  const v = Math.round(Number(n));
  if (!isFinite(v)) return NO_MIN;
  return Math.min(NO_MAX, Math.max(NO_MIN, v));
}

export function makeRange(lo: number | string, hi: number | string): Range {
  const a = clampNo(lo);
  const b = clampNo(hi);
  return a <= b ? { lo: a, hi: b } : { lo: b, hi: a };
}

export function parseRange(str: string | null | undefined): Range | null {
  const m = /^(\d+)-(\d+)$/.exec(str ?? '');
  return m ? makeRange(m[1], m[2]) : null;
}

export function rangeSlug(r: Range): string {
  return `${r.lo}-${r.hi}`;
}

export function rangeText(r: Range): string {
  return r.lo === NO_MIN && r.hi === NO_MAX ? 'All presidents' : `#${r.lo}–#${r.hi}`;
}

export function pool(r: Range): President[] {
  return PRESIDENTS.filter((p) => p.no >= r.lo && p.no <= r.hi);
}

export function rangesEqual(a: Range, b: Range): boolean {
  return a.lo === b.lo && a.hi === b.hi;
}
