import type { DomainCore, FieldKey, GivenKey, ModeKey, Ruler } from './domain';

export function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Some rulers hold more than one term: Cleveland and Trump under /us, Putin
 * under /ru. When the name is the prompt, either term is a valid answer — the
 * name alone cannot distinguish them. A portrait can: each term has its own
 * photograph, so it grades against that term only, like the other prompts.
 *
 * Searched over the whole domain rather than the selected range, so a term that
 * sits outside the current pool still counts as an answer. */
export function candidates(domain: DomainCore, rec: Ruler, given: GivenKey): Ruler[] {
  if (given !== 'name') return [rec];
  return domain.records.filter((r) => r.name === rec.name);
}

/** What to show as the prompt for a question in this mode. */
export function pickGiven(domain: DomainCore, mode: ModeKey): GivenKey {
  const givens = domain.givens;
  return mode === 'mixed' ? givens[Math.floor(Math.random() * givens.length)] : mode;
}

/** The fields the player has to type, given the one on show. A field prompt
 *  filters itself out; a portrait, not being a field, filters nothing — which is
 *  why /us asks three answers for a portrait and /ru asks two. */
export function answerFields(domain: DomainCore, given: GivenKey): FieldKey[] {
  return domain.order.filter((f) => f !== given);
}

export type Question = {
  rec: Ruler;
  given: GivenKey;
  answers: FieldKey[];
};

export type Grade = {
  allRight: boolean;
  /** Per-field correctness, scored against the best-fitting candidate term. */
  marks: Record<string, boolean>;
  /** Every term that counts as an answer — both of them for a repeat holder. */
  terms: Ruler[];
};

/**
 * Score a submitted answer. Pure: no DOM, no state, no side effects.
 * Scores every candidate term and keeps the best fit, so a player naming
 * either Cleveland term is credited for the one they actually meant.
 */
export function grade(domain: DomainCore, q: Question, inputs: Record<string, string>): Grade {
  const terms = candidates(domain, q.rec, q.given);

  let best: { marks: Record<string, boolean>; hits: number } | null = null;
  for (const r of terms) {
    const marks: Record<string, boolean> = {};
    let hits = 0;
    for (const f of q.answers) {
      const value = (inputs[f] ?? '').trim();
      marks[f] = value !== '' && domain.fields[f].check(r, value);
      if (marks[f]) hits++;
    }
    if (!best || hits > best.hits) best = { marks, hits };
  }

  return {
    allRight: best!.hits === q.answers.length,
    marks: best!.marks,
    terms,
  };
}

/**
 * A shuffled draw-pile over the active pool. Reshuffles when exhausted, so no
 * question repeats until the whole pool has cycled.
 */
export class Deck {
  private remaining: Ruler[] = [];
  private readonly picks: Ruler[];

  constructor(picks: Ruler[]) {
    this.picks = picks;
  }

  draw(): Ruler {
    if (!this.remaining.length) this.remaining = shuffle(this.picks);
    return this.remaining.pop()!;
  }
}
