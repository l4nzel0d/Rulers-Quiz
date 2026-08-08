import type { President } from '@/data/presidents';

/* Answer normalisation ------------------------------------------------------
 * Strict match, but only after case, spaces and punctuation are collapsed:
 *   "Dwight David Eisenhower" -> "dwightdavideisenhower"
 *   "2009 – 2017"             -> "20092017"
 * Generational suffixes are optional, so "James Earl Carter" is accepted
 * alongside "James Earl Carter Jr."
 */

export function norm(s: string | number): string {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function dropSuffix(key: string): string {
  return key.replace(/(jr|sr|ii|iii|iv)$/, '');
}

/** Every accepted spelling of a president's name, with and without a suffix. */
export function nameKeys(p: President): string[] {
  const keys: string[] = [];
  for (const n of [p.name, p.givenName]) {
    if (!n) continue;
    const k = norm(n);
    keys.push(k, dropSuffix(k));
  }
  return keys;
}

/** Every accepted spelling of a term. Ongoing terms take several forms. */
export function yearKeys(p: President): string[] {
  if (p.end !== null) return [norm(`${p.start}${p.end}`)];
  // Ongoing term: accept the open form or the scheduled end year.
  return [norm(`${p.start}present`), norm(`${p.start}`), norm(`${p.start}${p.start + 4}`)];
}

/** Display form, e.g. "1789–1797" (en dash). */
export function yearsText(p: President): string {
  return `${p.start}–${p.end === null ? 'present' : p.end}`;
}
