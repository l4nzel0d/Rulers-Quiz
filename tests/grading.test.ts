import { RU_CORE } from '@/domains/ru-core';
import { US_CORE } from '@/domains/us-core';
import { norm } from '@/lib/answers';
import { isModeKey, showsNumber, type DomainCore, type GivenKey } from '@/lib/domain';
import { Deck, answerFields, grade, pickGiven, type Question } from '@/lib/quiz';
import {
  bounds,
  covers,
  makeRange,
  makeSelection,
  parseSelection,
  parseSelectionIn,
  pool,
  selectionSlug,
  selectionText,
  toggleSpan,
} from '@/lib/range';

/* Both domains are exercised here. Only the *-core modules are imported: the
 * us.ts / ru.ts wrappers require() images, which this harness cannot load. */

let pass = 0;
const failures: string[] = [];

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) pass++;
  else failures.push(`${name}\n     expected ${e}\n     actual   ${a}`);
}

const byNo = (d: DomainCore, n: number) => d.records.find((r) => r.no === n)!;

/** Build a question and grade a submitted answer. */
function ask(d: DomainCore, no: number, given: GivenKey, inputs: Record<string, string>) {
  const q: Question = { rec: byNo(d, no), given, answers: answerFields(d, given) };
  return grade(d, q, inputs);
}

const US = US_CORE;
const RU = RU_CORE;

// ===========================================================================
// The US domain
// ===========================================================================

// ---- data sanity ----------------------------------------------------------
check('47 US records', US.records.length, 47);
check('US bounds', bounds(US), { lo: 1, hi: 47 });
check('pool 1-20 size', pool(US, [{ lo: 1, hi: 20 }]).length, 20);
check('pool respects bounds', pool(US, [{ lo: 6, hi: 8 }]).map((r) => r.no), [6, 7, 8]);
check('US numbers its rulers', showsNumber(US), true);

// ---- range codec ----------------------------------------------------------
check('parseSelection valid', parseSelection('1-20'), [{ lo: 1, hi: 20 }]);
check('parseSelection junk', parseSelection('banana'), null);
check('parseSelection null', parseSelection(null), null);
check('makeRange reorders', makeRange(US, 30, 4), { lo: 4, hi: 30 });
check('makeRange clamps', makeRange(US, -5, 900), { lo: 1, hi: 47 });
// Anything from outside the app is clamped on the way in, so a hand-edited URL
// or a range left over from the other domain cannot select an empty pool.
check('parseSelectionIn clamps', parseSelectionIn(US, '900-999'), [{ lo: 47, hi: 47 }]);
// The slider cannot draw a gap, so a multi-span URL keeps its first span here.
check('parseSelectionIn collapses under a slider', parseSelectionIn(US, '1-8,20-25'), [
  { lo: 1, hi: 8 },
]);
check('selectionText full', selectionText(US, [{ lo: 1, hi: 47 }]), 'All presidents');
check('selectionText partial', selectionText(US, [{ lo: 1, hi: 20 }]), '#1–#20');
check('selectionText names a preset', selectionText(US, [{ lo: 1, hi: 8 }]), 'Founding');

// ---- Cleveland: two terms, one name --------------------------------------
// Prompted with the name, EITHER term must be accepted.
check(
  'Cleveland #22 accepted from name prompt',
  ask(US, 22, 'name', { no: '22', years: '1885-1889' }).allRight,
  true
);
check(
  'Cleveland #24 accepted from the SAME name prompt',
  ask(US, 22, 'name', { no: '24', years: '1893-1897' }).allRight,
  true
);
check(
  'Cleveland reveal lists both terms',
  ask(US, 22, 'name', { no: '22', years: '1885-1889' }).terms.map((r) => r.no),
  [22, 24]
);
// Mixing halves of two different terms must NOT pass.
check(
  'Cleveland mismatched halves rejected',
  ask(US, 22, 'name', { no: '22', years: '1893-1897' }).allRight,
  false
);
// Prompted with the NUMBER, only that term's years are right.
check(
  'Cleveland #22 number prompt rejects #24 years',
  ask(US, 22, 'no', { name: 'Stephen Grover Cleveland', years: '1893-1897' }).allRight,
  false
);
check('number prompt reveals one term', ask(US, 22, 'no', { name: '', years: '' }).terms.length, 1);

// ---- Trump: same wrinkle, plus an ongoing term ---------------------------
check(
  'Trump #45 accepted from name prompt',
  ask(US, 47, 'name', { no: '45', years: '2017-2021' }).allRight,
  true
);
check(
  'Trump #47 ongoing "present"',
  ask(US, 47, 'name', { no: '47', years: '2025-present' }).allRight,
  true
);
check(
  'Trump #47 bare start year',
  ask(US, 47, 'no', { name: 'Donald John Trump', years: '2025' }).allRight,
  true
);
// The scheduled end is a field on the record now, not a start+4 guess.
check(
  'Trump #47 scheduled end year',
  ask(US, 47, 'no', { name: 'Donald John Trump', years: '2025-2029' }).allRight,
  true
);
check(
  'Trump #47 wrong end year rejected',
  ask(US, 47, 'no', { name: 'Donald John Trump', years: '2025-2030' }).allRight,
  false
);

// ---- suffixes are REQUIRED ------------------------------------------------
// There is no suffix-dropping anywhere in the app: the generational suffix is
// part of the name, exactly as a regnal numeral is under /ru.
check('Carter with suffix', US.fields.name.check(byNo(US, 39), 'James Earl Carter Jr.'), true);
check('Carter without suffix rejected', US.fields.name.check(byNo(US, 39), 'James Earl Carter'), false);
check('Obama with suffix', US.fields.name.check(byNo(US, 44), 'Barack Hussein Obama II'), true);
check(
  'Obama without suffix rejected',
  US.fields.name.check(byNo(US, 44), 'Barack Hussein Obama'),
  false
);

// ---- birth names ----------------------------------------------------------
check('Ford canonical', US.fields.name.check(byNo(US, 38), 'Gerald Rudolph Ford Jr.'), true);
check('Ford birth name', US.fields.name.check(byNo(US, 38), 'Leslie Lynch King Jr.'), true);
check(
  'Ford birth name without suffix rejected',
  US.fields.name.check(byNo(US, 38), 'Leslie Lynch King'),
  false
);
check('Grant birth name', US.fields.name.check(byNo(US, 18), 'Hiram Ulysses Grant'), true);
check('Eisenhower birth name', US.fields.name.check(byNo(US, 34), 'David Dwight Eisenhower'), true);
check(
  'Clinton birth name',
  US.fields.name.check(byNo(US, 42), 'William Jefferson Blythe III'),
  true
);

// ---- normalisation --------------------------------------------------------
check('case insensitive', US.fields.name.check(byNo(US, 44), 'barack hussein obama ii'), true);
check('punctuation collapsed', US.fields.name.check(byNo(US, 18), 'Ulysses S Grant'), true);
check('whitespace collapsed', US.fields.name.check(byNo(US, 1), '  George   Washington  '), true);
check('years with en dash', US.fields.years.check(byNo(US, 44), '2009 – 2017'), true);
check('years with no separator', US.fields.years.check(byNo(US, 44), '20092017'), true);
check('wrong name rejected', US.fields.name.check(byNo(US, 1), 'John Adams'), false);

// ---- empty input is never correct ----------------------------------------
check('empty both', ask(US, 16, 'no', { name: '', years: '' }).allRight, false);
check('empty one', ask(US, 16, 'no', { name: 'Abraham Lincoln', years: '' }).allRight, false);
check('whitespace only', ask(US, 16, 'no', { name: '   ', years: '1861-1865' }).allRight, false);
check('partial marks', ask(US, 16, 'no', { name: 'Abraham Lincoln', years: '' }).marks, {
  name: true,
  years: false,
});

// ---- deck: no repeat until the pool cycles -------------------------------
{
  const picks = pool(US, [{ lo: 1, hi: 10 }]);
  const deck = new Deck(picks);
  const firstCycle = Array.from({ length: 10 }, () => deck.draw().no).sort((a, b) => a - b);
  check('deck cycles through every pick once', firstCycle, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const secondCycle = Array.from({ length: 10 }, () => deck.draw().no).sort((a, b) => a - b);
  check('deck reshuffles after exhaustion', secondCycle, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const single = new Deck(pool(US, [{ lo: 5, hi: 5 }]));
  check('single-item pool repeats safely', [single.draw().no, single.draw().no], [5, 5]);
}

// ---- answerFields ---------------------------------------------------------
check('answers for no', answerFields(US, 'no'), ['name', 'years']);
check('answers for name', answerFields(US, 'name'), ['no', 'years']);
check('answers for years', answerFields(US, 'years'), ['no', 'name']);
// A portrait is not a field, so nothing is filtered out and all three are asked.
check('answers for portrait', answerFields(US, 'portrait'), ['no', 'name', 'years']);

// ---- portrait: one photo per number, all three fields typed ---------------
check(
  'portrait all three right',
  ask(US, 16, 'portrait', { no: '16', name: 'Abraham Lincoln', years: '1861-1865' }).allRight,
  true
);
check(
  'portrait needs the number too',
  ask(US, 16, 'portrait', { no: '', name: 'Abraham Lincoln', years: '1861-1865' }).allRight,
  false
);
check('portrait marks all three', ask(US, 16, 'portrait', { no: '16', years: '1861-1865' }).marks, {
  no: true,
  name: false,
  years: true,
});

// Each term has its own photograph, so unlike the name prompt the portrait
// pins the answer to one presidency number.
check(
  'Cleveland portrait #22 accepts its own term',
  ask(US, 22, 'portrait', { no: '22', name: 'Stephen Grover Cleveland', years: '1885-1889' })
    .allRight,
  true
);
check(
  'Cleveland portrait #22 rejects the #24 term',
  ask(US, 22, 'portrait', { no: '24', name: 'Stephen Grover Cleveland', years: '1893-1897' })
    .allRight,
  false
);
check(
  'portrait reveals exactly one term',
  ask(US, 22, 'portrait', {
    no: '22',
    name: 'Stephen Grover Cleveland',
    years: '1885-1889',
  }).terms.map((r) => r.no),
  [22]
);
check(
  'Trump portrait #47 rejects the #45 term',
  ask(US, 47, 'portrait', { no: '45', name: 'Donald John Trump', years: '2017-2021' }).allRight,
  false
);
check(
  'Trump portrait #47 takes the ongoing term',
  ask(US, 47, 'portrait', { no: '47', name: 'Donald John Trump', years: '2025-present' }).allRight,
  true
);
// Birth names still work when the face is the prompt.
check(
  'portrait accepts a birth name',
  ask(US, 18, 'portrait', { no: '18', name: 'Hiram Ulysses Grant', years: '1869-1877' }).allRight,
  true
);

// ---- modes ----------------------------------------------------------------
check('five US modes', US.modeKeys.length, 5);
check('portrait is a mode', isModeKey(US, 'portrait'), true);
check(
  'every US mode has copy',
  US.modeKeys.every((k) => Boolean(US.modes[k].title && US.modes[k].blurb)),
  true
);
check(
  'fixed modes show themselves',
  US.modeKeys.filter((m) => m !== 'mixed').map((m) => pickGiven(US, m)),
  ['no', 'name', 'years', 'portrait']
);
// Mixed rolls portraits too, so its questions vary between two and three fields.
check(
  'mixed draws from every given',
  US.givens.every((g) => Array.from({ length: 400 }, () => pickGiven(US, 'mixed')).includes(g)),
  true
);

// ===========================================================================
// The Russian domain
// ===========================================================================

// ---- normalisation is Unicode-aware --------------------------------------
// The ASCII-only predecessor reduced all of these to '' or to a bare numeral.
check('Cyrillic survives normalisation', norm('Владимир Путин'), 'владимирпутин');
check('ё folds to е', norm('Пётр'), norm('Петр'));
check('regnal numerals are kept', norm('Николай II'), 'николайii');
check('Nikolai I and II differ', norm('Николай I') === norm('Николай II'), false);

// ---- data sanity ----------------------------------------------------------
check('31 RU records', RU.records.length, 31);
check('RU bounds', bounds(RU), { lo: 1, hi: 31 });
check('RU hides its numbers', showsNumber(RU), false);
check('RU asks two fields', RU.order, ['name', 'years']);
check('four RU modes', RU.modeKeys.length, 4);
check('RU has no number mode', isModeKey(RU, 'no'), false);
// A portrait filters nothing out, and 'no' is not in the order, so /ru asks two.
check('RU portrait asks two fields', answerFields(RU, 'portrait'), ['name', 'years']);
check('RU name prompt asks one field', answerFields(RU, 'name'), ['years']);

// ---- eras -----------------------------------------------------------------
check('Romanov era size', pool(RU, [{ lo: 1, hi: 19 }]).length, 19);
check('Soviet era size', pool(RU, [{ lo: 20, hi: 27 }]).length, 8);
check('Russia era size', pool(RU, [{ lo: 28, hi: 31 }]).length, 4);
check('era chips cover everyone', RU.presets.map((p) => p.label), [
  'Все',
  'Романовы',
  'Советский период',
  'Россия',
]);
check('selectionText names an era', selectionText(RU, [{ lo: 20, hi: 27 }]), 'Советский период');
check('selectionText full', selectionText(RU, [{ lo: 1, hi: 31 }]), 'Все правители');
check('RU has no slider', RU.slider, false);

// ---- the chips are a set --------------------------------------------------
// Where the chips are the whole control they toggle, and any combination of
// eras is reachable — including one with a hole in it.
const ROMANOV = { lo: 1, hi: 19 };
const SOVIET = { lo: 20, hi: 27 };
const RUSSIA = { lo: 28, hi: 31 };
const ALL_RU = { lo: 1, hi: 31 };

// Two neighbouring eras are one run of `no`, so they merge — and the merge is
// invisible to the player, because the names come back out of coverage.
const sovietPlusRussia = makeSelection(RU, [SOVIET, RUSSIA]);
check('adjacent eras merge', sovietPlusRussia, [{ lo: 20, hi: 31 }]);
check('merged eras keep both names', selectionText(RU, sovietPlusRussia), 'Советский период + Россия');
check('merged eras pool together', pool(RU, sovietPlusRussia).length, 12);
check('a merged selection travels as one span', selectionSlug(sovietPlusRussia), '20-31');

// The case a single pair of bounds cannot express.
const gapped = makeSelection(RU, [ROMANOV, RUSSIA]);
check('a gapped selection keeps its hole', gapped, [ROMANOV, RUSSIA]);
check('a gapped selection skips the middle', pool(RU, gapped).length, 23);
check('a gapped selection names its eras', selectionText(RU, gapped), 'Романовы + Россия');
check('a gapped selection round-trips', parseSelectionIn(RU, selectionSlug(gapped)), gapped);
check('gapped slug', selectionSlug(gapped), '1-19,28-31');

// Coverage, not shape: the Soviet chip lights up inside "Все" too.
check('an era inside the full span still reads as covered', covers([ALL_RU], SOVIET), true);
check('a partly covered era is not covered', covers([{ lo: 20, hi: 25 }], SOVIET), false);

// Toggling: off subtracts, and cutting the middle out of "Все" is how the
// gapped selection is reached in the UI.
check('toggle off cuts a hole', toggleSpan(RU, [ALL_RU], SOVIET), gapped);
check('toggle on adds an era', toggleSpan(RU, [ROMANOV], RUSSIA), [ROMANOV, RUSSIA]);
check('toggle back on refills the hole', toggleSpan(RU, gapped, SOVIET), [ALL_RU]);
// The last era standing cannot be switched off: an empty selection is an empty
// pool, and a chip that answered a tap by selecting everything would be worse.
check('the last era stays lit', toggleSpan(RU, [ROMANOV], ROMANOV), [ROMANOV]);

// ---- regnal numerals are part of the name --------------------------------
const nikolai1 = byNo(RU, 16);
const nikolai2 = byNo(RU, 19);
check('Николай I accepted for itself', RU.fields.name.check(nikolai1, 'Николай I'), true);
check('Николай II rejected for Николай I', RU.fields.name.check(nikolai1, 'Николай II'), false);
check('Николай II accepted for itself', RU.fields.name.check(nikolai2, 'Николай II'), true);
check('Николай I rejected for Николай II', RU.fields.name.check(nikolai2, 'Николай I'), false);

// ---- aliases and birth names ---------------------------------------------
const peter1 = byNo(RU, 6);
check('Пётр I canonical', RU.fields.name.check(peter1, 'Пётр I'), true);
check('Пётр I without ё', RU.fields.name.check(peter1, 'Петр I'), true);
check('Пётр Великий accepted', RU.fields.name.check(peter1, 'Пётр Великий'), true);
check('Пётр Алексеевич accepted', RU.fields.name.check(peter1, 'Пётр Алексеевич'), true);
check('Пётр II rejected for Пётр I', RU.fields.name.check(peter1, 'Пётр II'), false);
check(
  'Екатерина Великая accepted',
  RU.fields.name.check(byNo(RU, 13), 'Екатерина Великая'),
  true
);
check('Ленин по фамилии', RU.fields.name.check(byNo(RU, 20), 'Ленин'), true);
check(
  'Ленин по имени при рождении',
  RU.fields.name.check(byNo(RU, 20), 'Владимир Ильич Ульянов'),
  true
);
check('Сталин — Джугашвили', RU.fields.name.check(byNo(RU, 21), 'Иосиф Виссарионович Джугашвили'), true);

// ---- years ----------------------------------------------------------------
check('Екатерина II годы', RU.fields.years.check(byNo(RU, 13), '1762-1796'), true);
check('ongoing term, open form', RU.fields.years.check(byNo(RU, 31), '2012-настоящее время'), true);
check('ongoing term, bare start', RU.fields.years.check(byNo(RU, 31), '2012'), true);
check('ongoing term, scheduled end', RU.fields.years.check(byNo(RU, 31), '2012-2030'), true);
check('ongoing term, wrong end', RU.fields.years.check(byNo(RU, 31), '2012-2024'), false);

// ---- Putin: two spans, one name — the Cleveland case in Russian ----------
check(
  'Путин: первый срок принят по имени',
  ask(RU, 31, 'name', { years: '2000-2008' }).allRight,
  true
);
check(
  'Путин: текущий срок принят по тому же имени',
  ask(RU, 31, 'name', { years: '2012-настоящее время' }).allRight,
  true
);
check(
  'Путин: в разборе оба срока',
  ask(RU, 31, 'name', { years: '2000-2008' }).terms.map((r) => r.no),
  [29, 31]
);
check(
  'Путин: чужие годы отвергнуты',
  ask(RU, 31, 'name', { years: '2008-2012' }).allRight,
  false
);
// A portrait pins the answer to its own span, exactly as it does for Cleveland.
check(
  'Путин: портрет 2012 отвергает срок 2000-2008',
  ask(RU, 31, 'portrait', { name: 'Владимир Владимирович Путин', years: '2000-2008' }).allRight,
  false
);
check(
  'Путин: портрет 2012 принимает свой срок',
  ask(RU, 31, 'portrait', { name: 'Владимир Владимирович Путин', years: '2012-2030' }).allRight,
  true
);

// ---- the two domains do not share a range --------------------------------
// Both index on `no`, so an unclamped span would silently mean something else.
check('RU clamps a US-sized range', parseSelectionIn(RU, '1-47'), [{ lo: 1, hi: 31 }]);
// A span that clamps onto its neighbour comes back as one, never as a duplicate.
check('RU clamps every span it is handed', parseSelectionIn(RU, '1-19,25-47'), [
  { lo: 1, hi: 19 },
  { lo: 25, hi: 31 },
]);

// ---- report ---------------------------------------------------------------
console.log(`\n  ${pass} passed, ${failures.length} failed\n`);
for (const f of failures) console.log('  ✕ ' + f + '\n');
process.exit(failures.length ? 1 : 0);
