import type { DomainCore, Ruler } from './domain';

/* Which slice of a domain is in play. Persisted per domain so the choice
 * survives navigation and app restarts, and mirrored into the quiz URL on web
 * (/us/quiz/mixed?range=1-20) so a round stays shareable there.
 *
 * Both domains index on `no`. /us shows those numbers, so a span reads as
 * "#1–#20"; /ru never shows them, so the same span reads as an era name and the
 * chips are the only way to move it.
 *
 * A *selection* is a list of spans, because those chips are a set: "Романовы +
 * Россия" skips the Soviet period, and no single pair of bounds can say that.
 * The list is kept sorted, disjoint and non-adjacent — makeSelection folds
 * touching spans into one — so two neighbouring eras still travel as the single
 * span they are, and every consumer can compare shapes without re-merging.
 * A slider domain holds exactly one span; there the shape never varies. */

/** One run of `no`, inclusive at both ends. */
export type Range = { lo: number; hi: number };

/** Everything in play: sorted, disjoint, non-adjacent, never empty. */
export type Selection = Range[];

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

/** Everything in play. Also the fallback wherever a stored or linked selection
 *  turns out to be unreadable. */
export function fullSelection(domain: DomainCore): Selection {
  return [bounds(domain)];
}

/** The one way to build a Selection: clamps every span, sorts them, and merges
 *  any that overlap *or touch*. Adjacency matters — the Soviet period ends at 27
 *  and Russia starts at 28, so holding them apart would print a "+" over a pool
 *  that is simply contiguous. Names survive the merge anyway, because
 *  selectionText reads coverage rather than shape. */
export function makeSelection(domain: DomainCore, spans: Range[]): Selection {
  const sorted = spans
    .map((s) => makeRange(domain, s.lo, s.hi))
    .sort((a, b) => a.lo - b.lo || a.hi - b.hi);

  const out: Range[] = [];
  for (const s of sorted) {
    const prev = out[out.length - 1];
    if (prev && s.lo <= prev.hi + 1) prev.hi = Math.max(prev.hi, s.hi);
    else out.push({ ...s });
  }
  return out.length ? out : fullSelection(domain);
}

/** Whether every `no` in `span` is somewhere in the selection. Because spans are
 *  merged, one of them has to hold the whole thing. Drives the chips' selected
 *  state, so a chip lights up when its era is in play however it got there. */
export function covers(sel: Selection, span: Range): boolean {
  return sel.some((s) => s.lo <= span.lo && s.hi >= span.hi);
}

export function isFullSelection(domain: DomainCore, sel: Selection): boolean {
  return covers(sel, bounds(domain));
}

/** Adds a span, or takes it back out if it is already wholly in play. The last
 *  one standing is refused: an empty selection would mean an empty pool, and a
 *  chip that answers a tap by quietly selecting everything is worse than one
 *  that stays lit. */
export function toggleSpan(domain: DomainCore, sel: Selection, span: Range): Selection {
  const s = makeRange(domain, span.lo, span.hi);
  if (!covers(sel, s)) return makeSelection(domain, [...sel, s]);
  const rest = subtract(sel, s);
  return rest.length ? rest : sel;
}

/** Everything in `sel` outside `cut`. A cut through the middle of a span leaves
 *  the two ends behind, which is how "all, minus the Soviet period" is spelled. */
function subtract(sel: Selection, cut: Range): Selection {
  const out: Range[] = [];
  for (const s of sel) {
    if (cut.hi < s.lo || cut.lo > s.hi) {
      out.push({ ...s });
      continue;
    }
    if (s.lo < cut.lo) out.push({ lo: s.lo, hi: cut.lo - 1 });
    if (s.hi > cut.hi) out.push({ lo: cut.hi + 1, hi: s.hi });
  }
  return out;
}

export function rangeSlug(r: Range): string {
  return `${r.lo}-${r.hi}`;
}

/** The URL and storage form. One span stays "20-27"; a gapped selection is
 *  comma-joined, "1-19,28-31". */
export function selectionSlug(sel: Selection): string {
  return sel.map(rangeSlug).join(',');
}

/** Domain-free: the URL and storage forms are just integers in pairs. A bare
 *  "20-27" from a link or a store written by an older build still reads. */
export function parseSelection(str: string | null | undefined): Selection | null {
  const parts = (str ?? '').split(',');
  const out: Range[] = [];
  for (const part of parts) {
    const m = /^(\d+)-(\d+)$/.exec(part);
    if (!m) return null;
    out.push({ lo: Number(m[1]), hi: Number(m[2]) });
  }
  return out.length ? out : null;
}

/** Parse and clamp in one step. Use this for anything that arrives from outside
 *  the app — a stored value or a ?range= query param — so a stale span from the
 *  other domain, or a hand-edited URL, cannot select an empty pool. */
export function parseSelectionIn(
  domain: DomainCore,
  str: string | null | undefined
): Selection | null {
  const raw = parseSelection(str);
  if (!raw) return null;
  const sel = makeSelection(domain, raw);
  // A slider cannot draw a gap, so a domain that has one keeps the first span of
  // a hand-edited multi-span URL rather than inventing the records between them.
  return domain.slider ? sel.slice(0, 1) : sel;
}

/** The readout beside the picker heading, and the range half of the quiz tag.
 *
 *  Names come from coverage, not from the shape of the list: two eras that
 *  merged into one span are still two named eras, and that is the whole reason
 *  /ru can print "Советский период + Россия" for what is stored as 20-31. The
 *  numeric fallback is only reached by a span no set of presets accounts for —
 *  a slider drag, in practice, which is why /ru never sees it. */
export function selectionText(domain: DomainCore, sel: Selection): string {
  if (isFullSelection(domain, sel)) return domain.strings.rangeAll;

  const full = bounds(domain);
  const named = domain.presets
    .filter((p) => !(p.lo === full.lo && p.hi === full.hi) && covers(sel, p))
    .sort((a, b) => a.lo - b.lo);

  if (named.length && selectionsEqual(makeSelection(domain, named), sel)) {
    return named.map((p) => p.label).join(' + ');
  }
  return sel.map((s) => spanText(domain, s)).join(' + ');
}

function spanText(domain: DomainCore, r: Range): string {
  const preset = domain.presets.find((p) => p.lo === r.lo && p.hi === r.hi);
  return preset ? preset.label : domain.strings.rangeSpan(r.lo, r.hi);
}

/** Records in play, in the domain's own order — a gap in the selection is a gap
 *  in the pool, not a reordering. */
export function pool(domain: DomainCore, sel: Selection): Ruler[] {
  return domain.records.filter((x) => sel.some((s) => x.no >= s.lo && x.no <= s.hi));
}

export function rangesEqual(a: Range, b: Range): boolean {
  return a.lo === b.lo && a.hi === b.hi;
}

/** Both sides must be normalised — which, coming out of makeSelection, they are. */
export function selectionsEqual(a: Selection, b: Selection): boolean {
  return a.length === b.length && a.every((s, i) => rangesEqual(s, b[i]));
}
