import type { Ruler } from './domain';

/* Answer normalisation ------------------------------------------------------
 * Strict match, but only after case, spaces and punctuation are collapsed:
 *   "Dwight David Eisenhower" -> "dwightdavideisenhower"
 *   "Пётр I"                  -> "петрi"
 *   "2009 – 2017"             -> "20092017"
 *
 * Unicode-aware on purpose. The ASCII-only form this replaced reduced every
 * Cyrillic name to the empty string and made "Пётр I" and "Николай I" equal,
 * because it kept only the Latin numeral. `ё` folds to `е`: nobody types it
 * consistently, and no two rulers are told apart by it.
 *
 * Suffixes are significant — there is no suffix-dropping anywhere in the app.
 * "Barack Hussein Obama" is not accepted for #44, and Николай I is not accepted
 * for Николай II. The same rule reads as strictness in English and as plain
 * correctness in Russian.
 */

export function norm(s: string | number): string {
  return String(s)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/** Every accepted spelling of a ruler's name: the canonical one, the birth name
 *  where it differs, and any further aliases the record carries. */
export function nameKeys(r: Ruler): string[] {
  const keys: string[] = [];
  for (const n of [r.name, r.givenName, ...(r.aliases ?? [])]) {
    if (n) keys.push(norm(n));
  }
  return keys;
}

/** Every accepted spelling of a term. An ongoing term takes several forms: the
 *  open one in the domain's own words, the bare start year, and the scheduled
 *  end year when the record names one. */
export function yearKeys(r: Ruler, presentAliases: string[]): string[] {
  if (r.end !== null) return [norm(`${r.start}${r.end}`)];
  const keys = presentAliases.map((word) => norm(`${r.start}${word}`));
  keys.push(norm(`${r.start}`));
  if (r.scheduledEnd) keys.push(norm(`${r.start}${r.scheduledEnd}`));
  return keys;
}

/** Display form, e.g. "1789–1797" (en dash). */
export function yearsText(r: Ruler, present: string): string {
  return `${r.start}–${r.end === null ? present : r.end}`;
}
