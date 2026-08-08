import { PRESIDENTS, type President } from '@/data/presidents';
import { FIELDS, ORDER, type FieldKey, type ModeKey } from './fields';

export function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Cleveland and Trump each hold two presidency numbers. When the name is the
 * prompt, either term is a valid answer. */
export function candidates(rec: President, given: FieldKey): President[] {
  if (given !== 'name') return [rec];
  return PRESIDENTS.filter((p) => p.name === rec.name);
}

/** Which field to show as the prompt for a question in this mode. */
export function pickGiven(mode: ModeKey): FieldKey {
  return mode === 'mixed' ? ORDER[Math.floor(Math.random() * ORDER.length)] : mode;
}

/** The two fields the player has to type, given the one on show. */
export function answerFields(given: FieldKey): FieldKey[] {
  return ORDER.filter((f) => f !== given);
}

export type Question = {
  rec: President;
  given: FieldKey;
  answers: FieldKey[];
};

export type Grade = {
  allRight: boolean;
  /** Per-field correctness, scored against the best-fitting candidate term. */
  marks: Record<string, boolean>;
  /** Every term that counts as an answer — both for Cleveland/Trump. */
  terms: President[];
};

/**
 * Score a submitted answer. Pure: no DOM, no state, no side effects.
 * Scores every candidate term and keeps the best fit, so a player naming
 * either Cleveland term is credited for the one they actually meant.
 */
export function grade(q: Question, inputs: Record<string, string>): Grade {
  const terms = candidates(q.rec, q.given);

  let best: { marks: Record<string, boolean>; hits: number } | null = null;
  for (const p of terms) {
    const marks: Record<string, boolean> = {};
    let hits = 0;
    for (const f of q.answers) {
      const value = (inputs[f] ?? '').trim();
      marks[f] = value !== '' && FIELDS[f].check(p, value);
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
  private remaining: President[] = [];
  private readonly picks: President[];

  constructor(picks: President[]) {
    this.picks = picks;
  }

  draw(): President {
    if (!this.remaining.length) this.remaining = shuffle(this.picks);
    return this.remaining.pop()!;
  }
}
