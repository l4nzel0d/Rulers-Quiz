import type { ImageSourcePropType, KeyboardTypeOptions } from 'react-native';

/* The shape every domain fills in. This file is the vocabulary; the instances
 * live in src/domains/. One registry drives a whole quiz — the screens read
 * labels, keyboards, prompts and grading out of the domain they were handed and
 * name no ruler, no field and no language of their own.
 *
 * Types only, so `import type` from React Native is erased before the test
 * harness sees it — see AGENTS.md on why src/lib may not import RN values. */

/** One term. `no` is a chronological index: /us shows it and asks for it, /ru
 *  keeps it only to order and slice the pool. */
export type Ruler = {
  no: number;
  name: string;
  start: number;
  /** null means the term is ongoing */
  end: number | null;
  /** The year an ongoing term is due to end, when one is scheduled. Replaces the
   *  old `start + 4` guess, which was a US-only assumption — Russian terms run six. */
  scheduledEnd?: number;
  /** Birth name, shown in the list and the reveal when it differs from `name`. */
  givenName?: string;
  /** Further accepted spellings. Never displayed — Пётр Великий, Екатерина Великая. */
  aliases?: string[];
};

/** The typeable things. A domain narrows this with `order`; /ru omits 'no'. */
export type FieldKey = 'no' | 'name' | 'years';
/** What a question can show. A portrait is shown but never typed, which is why
 *  this is wider than FieldKey and has no FieldSpec. */
export type GivenKey = FieldKey | 'portrait';
/** A mode names the prompt. */
export type ModeKey = GivenKey | 'mixed';

export type FieldSpec = {
  label: string;
  placeholder: string;
  /** Replaces the web build's inputmode="numeric". */
  keyboardType?: KeyboardTypeOptions;
  show: (r: Ruler) => string;
  check: (r: Ruler, v: string) => boolean;
};

/** A named span of `no`, offered as a chip in the range picker. */
export type Preset = { label: string; lo: number; hi: number };

/** Every user-facing string that is not a field label or a mode title. */
export type DomainStrings = {
  /** Menu screen intro. */
  lede: string;
  /** Footnote under the quiz card. */
  hint: string;
  /** The link at the foot of every screen. */
  back: string;
  /** Menu link back out to the chooser, above both domains. Each domain says it
   *  in its own language, because the player is still inside one when they read it. */
  chooser: string;
  /** Menu link through to the list screen. */
  browse: (terms: number) => string;
  /** List screen intro. */
  listLede: (terms: number, people: number) => string;
  /** Range picker heading. */
  rangeTitle: string;
  /** Range picker live count, e.g. "20 terms". */
  count: (n: number) => string;
  /** The two ends of the selected pool, appended to the count. */
  spanNames: (first: string, last: string) => string;
  /** Range readout when the whole pool is in play. */
  rangeAll: string;
  /** Range readout for a partial span. */
  rangeSpan: (lo: number, hi: number) => string;
  /** Accessibility labels for the two slider thumbs. Unused when slider is false. */
  thumbLo: string;
  thumbHi: string;
  /** Prompt heading for a portrait question — the one given with no FieldSpec. */
  portrait: string;
  /** Display word for an ongoing term, e.g. "present" / "н. в.". */
  present: string;
  /** Accepted spellings for an ongoing term's open end. */
  presentAliases: string[];
  /** The two quiz buttons. */
  check: string;
  next: string;
  /** Shown when the selected range holds nobody. */
  emptyPool: string;
  /** Reveal panel verdicts. */
  correct: string;
  notQuite: string;
  /** Reveal panel birth-name note, wrapped around the name itself. */
  bornPrefix: string;
  bornSuffix: string;
};

/** Everything about a domain that is pure data — no bundler required, so the
 *  test suite can import it. Assets are added on top in the sibling module. */
export type DomainCore = {
  key: 'us' | 'ru';
  /** AppBar title. */
  brand: string;
  records: Ruler[];
  /** Total, so `fields[given]` never needs a null check. A domain that does not
   *  use a field simply leaves it out of `order` and `givens`. */
  fields: Record<FieldKey, FieldSpec>;
  /** The typeable fields, in the order they are asked. */
  order: FieldKey[];
  /** Everything a question can show. What `mixed` rolls between. */
  givens: GivenKey[];
  modes: Record<ModeKey, { title: string; blurb: string }>;
  modeKeys: ModeKey[];
  presets: Preset[];
  /** Whether the range picker offers the twin-thumb slider as well as the chips. */
  slider: boolean;
  /** Replaces colors.brick throughout this domain. */
  accent: string;
  strings: DomainStrings;
};

export type Domain = DomainCore & {
  /** One image per `no`. Lives in src/components/ because it require()s assets.
   *  A missing entry renders as an empty frame rather than crashing. */
  portraits: Record<number, ImageSourcePropType>;
  /** null paints the scrim over a flat ground — a domain whose photograph has
   *  not been sourced yet still renders in its own colours. */
  background: ImageSourcePropType | null;
};

/** The prompt heading. A portrait has no FieldSpec of its own. */
export function givenLabel(domain: DomainCore, given: GivenKey): string {
  return given === 'portrait' ? domain.strings.portrait : domain.fields[given].label;
}

export function isModeKey(domain: DomainCore, v: string | undefined): v is ModeKey {
  return v !== undefined && (domain.modeKeys as string[]).includes(v);
}

/** Whether this domain puts its `no` on screen at all. */
export function showsNumber(domain: DomainCore): boolean {
  return domain.order.includes('no');
}
