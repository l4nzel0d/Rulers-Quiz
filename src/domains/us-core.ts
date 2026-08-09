import { US_PRESIDENTS } from '@/data/us-presidents';
import { nameKeys, norm, yearKeys, yearsText } from '@/lib/answers';
import type { DomainCore, FieldKey, FieldSpec, GivenKey, ModeKey } from '@/lib/domain';

/* The US domain, minus its images. Everything here is pure data, so `npm test`
 * can import it under `node --experimental-strip-types`; the portraits and the
 * background live in the sibling us.ts, which require()s assets and therefore
 * needs a bundler. Keep that split — see AGENTS.md. */

const PRESENT_ALIASES = ['present'];

const FIELDS: Record<FieldKey, FieldSpec> = {
  no: {
    label: 'Number',
    placeholder: 'e.g. 44',
    keyboardType: 'number-pad',
    show: (r) => `#${r.no}`,
    check: (r, v) => norm(v) === norm(r.no),
  },
  name: {
    label: 'Full name',
    placeholder: 'e.g. Barack Hussein Obama II',
    show: (r) => r.name,
    check: (r, v) => nameKeys(r).includes(norm(v)),
  },
  years: {
    label: 'Years in office',
    placeholder: 'e.g. 2009-2017',
    keyboardType: 'numbers-and-punctuation',
    show: (r) => yearsText(r, 'present'),
    check: (r, v) => yearKeys(r, PRESENT_ALIASES).includes(norm(v)),
  },
};

const ORDER: FieldKey[] = ['no', 'name', 'years'];
const GIVENS: GivenKey[] = ['no', 'name', 'years', 'portrait'];
const MODE_KEYS: ModeKey[] = ['no', 'name', 'years', 'portrait', 'mixed'];

export const US_CORE: DomainCore = {
  key: 'us',
  brand: 'US Presidents Quiz',
  records: US_PRESIDENTS,
  fields: FIELDS,
  order: ORDER,
  givens: GIVENS,
  modeKeys: MODE_KEYS,
  modes: {
    no: { title: 'Given the number', blurb: 'Every question shows a presidency number.' },
    name: { title: 'Given the name', blurb: 'Every question shows a full name.' },
    years: { title: 'Given the years', blurb: 'Every question shows a term.' },
    portrait: { title: 'Given the portrait', blurb: 'A photograph, and all three answers.' },
    mixed: { title: 'Mixed', blurb: 'The given piece changes each question.' },
  },
  presets: [
    { label: 'All', lo: 1, hi: 47 },
    { label: 'Founding', lo: 1, hi: 8 },
    { label: '19th c.', lo: 6, hi: 25 },
    { label: 'Modern', lo: 32, hi: 47 },
  ],
  slider: true,
  accent: '#8a3426', // the flag's red — styles.css:12
  strings: {
    lede:
      'Every round gives you a piece of a presidency — a number, a name, a term or a face — ' +
      'and asks for the rest. Questions keep coming until you stop.',
    hint: 'Full names only — suffixes included, birth names accepted where they differ.',
    back: '← Back to modes',
    chooser: '← Pick another quiz',
    browse: (terms) => `Browse all ${terms} terms →`,
    listLede: (terms, people) =>
      `${terms} terms, ${people} people. Cleveland and Trump each appear twice — ` +
      'nonconsecutive terms get separate numbers.',
    rangeTitle: 'Presidents in play',
    count: (n) => `${n} ${n === 1 ? 'term' : 'terms'}`,
    spanNames: (first, last) => ` — ${first} to ${last}`,
    rangeAll: 'All presidents',
    rangeSpan: (lo, hi) => `#${lo}–#${hi}`,
    thumbLo: 'Lowest presidency number',
    thumbHi: 'Highest presidency number',
    portrait: 'Portrait',
    present: 'present',
    presentAliases: PRESENT_ALIASES,
    check: 'Check',
    next: 'Next question',
    emptyPool: 'No presidents in this range.',
    correct: 'Correct',
    notQuite: 'Not quite',
    bornPrefix: 'Born',
    bornSuffix: '— either full name is accepted.',
  },
};
