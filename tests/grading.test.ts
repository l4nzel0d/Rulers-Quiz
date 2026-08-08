import { PRESIDENTS } from '@/data/presidents';
import { FIELDS, GIVENS, MODES, MODE_KEYS, isModeKey } from '@/lib/fields';
import { Deck, answerFields, grade, pickGiven, type Question } from '@/lib/quiz';
import { NO_MAX, NO_MIN, makeRange, parseRange, pool, rangeText } from '@/lib/range';
import type { GivenKey } from '@/lib/fields';

let pass = 0;
const failures: string[] = [];

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) pass++;
  else failures.push(`${name}\n     expected ${e}\n     actual   ${a}`);
}

const byNo = (n: number) => PRESIDENTS.find((p) => p.no === n)!;

/** Build a question and grade a submitted answer. */
function ask(no: number, given: GivenKey, inputs: Record<string, string>) {
  const q: Question = { rec: byNo(no), given, answers: answerFields(given) };
  return grade(q, inputs);
}

// ---- data sanity ----------------------------------------------------------
check('47 records', PRESIDENTS.length, 47);
check('range bounds', [NO_MIN, NO_MAX], [1, 47]);
check('pool 1-20 size', pool({ lo: 1, hi: 20 }).length, 20);
check('pool respects bounds', pool({ lo: 6, hi: 8 }).map((p) => p.no), [6, 7, 8]);

// ---- range codec ----------------------------------------------------------
check('parseRange valid', parseRange('1-20'), { lo: 1, hi: 20 });
check('parseRange junk', parseRange('banana'), null);
check('parseRange null', parseRange(null), null);
check('makeRange reorders', makeRange(30, 4), { lo: 4, hi: 30 });
check('makeRange clamps', makeRange(-5, 900), { lo: 1, hi: 47 });
check('rangeText full', rangeText({ lo: 1, hi: 47 }), 'All presidents');
check('rangeText partial', rangeText({ lo: 1, hi: 20 }), '#1–#20');

// ---- Cleveland: two terms, one name --------------------------------------
// Prompted with the name, EITHER term must be accepted.
check(
  'Cleveland #22 accepted from name prompt',
  ask(22, 'name', { no: '22', years: '1885-1889' }).allRight,
  true
);
check(
  'Cleveland #24 accepted from the SAME name prompt',
  ask(22, 'name', { no: '24', years: '1893-1897' }).allRight,
  true
);
check(
  'Cleveland reveal lists both terms',
  ask(22, 'name', { no: '22', years: '1885-1889' }).terms.map((p) => p.no),
  [22, 24]
);
// Mixing halves of two different terms must NOT pass.
check(
  'Cleveland mismatched halves rejected',
  ask(22, 'name', { no: '22', years: '1893-1897' }).allRight,
  false
);
// Prompted with the NUMBER, only that term's years are right.
check(
  'Cleveland #22 number prompt rejects #24 years',
  ask(22, 'no', { name: 'Stephen Grover Cleveland', years: '1893-1897' }).allRight,
  false
);
check('number prompt reveals one term', ask(22, 'no', { name: '', years: '' }).terms.length, 1);

// ---- Trump: same wrinkle, plus an ongoing term ---------------------------
check(
  'Trump #45 accepted from name prompt',
  ask(47, 'name', { no: '45', years: '2017-2021' }).allRight,
  true
);
check(
  'Trump #47 ongoing "present"',
  ask(47, 'name', { no: '47', years: '2025-present' }).allRight,
  true
);
check('Trump #47 bare start year', ask(47, 'no', { name: 'Donald John Trump', years: '2025' }).allRight, true);
check(
  'Trump #47 scheduled end year',
  ask(47, 'no', { name: 'Donald John Trump', years: '2025-2029' }).allRight,
  true
);
check(
  'Trump #47 wrong end year rejected',
  ask(47, 'no', { name: 'Donald John Trump', years: '2025-2030' }).allRight,
  false
);

// ---- suffixes are optional ------------------------------------------------
check('Carter with suffix', FIELDS.name.check(byNo(39), 'James Earl Carter Jr.'), true);
check('Carter without suffix', FIELDS.name.check(byNo(39), 'James Earl Carter'), true);
check('Obama with suffix', FIELDS.name.check(byNo(44), 'Barack Hussein Obama II'), true);
check('Obama without suffix', FIELDS.name.check(byNo(44), 'Barack Hussein Obama'), true);

// ---- birth names ----------------------------------------------------------
check('Ford canonical', FIELDS.name.check(byNo(38), 'Gerald Rudolph Ford Jr.'), true);
check('Ford birth name', FIELDS.name.check(byNo(38), 'Leslie Lynch King Jr.'), true);
check('Ford birth name no suffix', FIELDS.name.check(byNo(38), 'Leslie Lynch King'), true);
check('Grant birth name', FIELDS.name.check(byNo(18), 'Hiram Ulysses Grant'), true);
check('Eisenhower birth name', FIELDS.name.check(byNo(34), 'David Dwight Eisenhower'), true);
check('Clinton birth name', FIELDS.name.check(byNo(42), 'William Jefferson Blythe III'), true);

// ---- normalisation --------------------------------------------------------
check('case insensitive', FIELDS.name.check(byNo(44), 'barack hussein obama ii'), true);
check('punctuation collapsed', FIELDS.name.check(byNo(18), 'Ulysses S Grant'), true);
check('whitespace collapsed', FIELDS.name.check(byNo(1), '  George   Washington  '), true);
check('years with en dash', FIELDS.years.check(byNo(44), '2009 – 2017'), true);
check('years with no separator', FIELDS.years.check(byNo(44), '20092017'), true);
check('wrong name rejected', FIELDS.name.check(byNo(1), 'John Adams'), false);

// ---- empty input is never correct ----------------------------------------
check('empty both', ask(16, 'no', { name: '', years: '' }).allRight, false);
check('empty one', ask(16, 'no', { name: 'Abraham Lincoln', years: '' }).allRight, false);
check('whitespace only', ask(16, 'no', { name: '   ', years: '1861-1865' }).allRight, false);
check('partial marks', ask(16, 'no', { name: 'Abraham Lincoln', years: '' }).marks, {
  name: true,
  years: false,
});

// ---- deck: no repeat until the pool cycles -------------------------------
{
  const picks = pool({ lo: 1, hi: 10 });
  const deck = new Deck(picks);
  const firstCycle = Array.from({ length: 10 }, () => deck.draw().no).sort((a, b) => a - b);
  check('deck cycles through every pick once', firstCycle, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const secondCycle = Array.from({ length: 10 }, () => deck.draw().no).sort((a, b) => a - b);
  check('deck reshuffles after exhaustion', secondCycle, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const single = new Deck(pool({ lo: 5, hi: 5 }));
  check('single-item pool repeats safely', [single.draw().no, single.draw().no], [5, 5]);
}

// ---- answerFields ---------------------------------------------------------
check('answers for no', answerFields('no'), ['name', 'years']);
check('answers for name', answerFields('name'), ['no', 'years']);
check('answers for years', answerFields('years'), ['no', 'name']);
// A portrait is not a field, so nothing is filtered out and all three are asked.
check('answers for portrait', answerFields('portrait'), ['no', 'name', 'years']);

// ---- portrait: one photo per number, all three fields typed ---------------
check(
  'portrait all three right',
  ask(16, 'portrait', { no: '16', name: 'Abraham Lincoln', years: '1861-1865' }).allRight,
  true
);
check(
  'portrait needs the number too',
  ask(16, 'portrait', { no: '', name: 'Abraham Lincoln', years: '1861-1865' }).allRight,
  false
);
check('portrait marks all three', ask(16, 'portrait', { no: '16', years: '1861-1865' }).marks, {
  no: true,
  name: false,
  years: true,
});

// Each term has its own photograph, so unlike the name prompt the portrait
// pins the answer to one presidency number.
check(
  'Cleveland portrait #22 accepts its own term',
  ask(22, 'portrait', { no: '22', name: 'Stephen Grover Cleveland', years: '1885-1889' }).allRight,
  true
);
check(
  'Cleveland portrait #22 rejects the #24 term',
  ask(22, 'portrait', { no: '24', name: 'Stephen Grover Cleveland', years: '1893-1897' }).allRight,
  false
);
check(
  'portrait reveals exactly one term',
  ask(22, 'portrait', { no: '22', name: 'Stephen Grover Cleveland', years: '1885-1889' }).terms.map(
    (p) => p.no
  ),
  [22]
);
check(
  'Trump portrait #47 rejects the #45 term',
  ask(47, 'portrait', { no: '45', name: 'Donald John Trump', years: '2017-2021' }).allRight,
  false
);
check(
  'Trump portrait #47 takes the ongoing term',
  ask(47, 'portrait', { no: '47', name: 'Donald John Trump', years: '2025-present' }).allRight,
  true
);
// Birth names still work when the face is the prompt.
check(
  'portrait accepts a birth name',
  ask(18, 'portrait', { no: '18', name: 'Hiram Ulysses Grant', years: '1869-1877' }).allRight,
  true
);

// ---- modes ----------------------------------------------------------------
check('five modes', MODE_KEYS.length, 5);
check('portrait is a mode', isModeKey('portrait'), true);
check(
  'every mode has copy',
  MODE_KEYS.every((k) => Boolean(MODES[k].title && MODES[k].blurb)),
  true
);
check(
  'fixed modes show themselves',
  MODE_KEYS.filter((m) => m !== 'mixed').map((m) => pickGiven(m)),
  ['no', 'name', 'years', 'portrait']
);
// Mixed rolls portraits too, so its questions vary between two and three fields.
check(
  'mixed draws from every given',
  GIVENS.every((g) => Array.from({ length: 400 }, () => pickGiven('mixed')).includes(g)),
  true
);

// ---- report ---------------------------------------------------------------
console.log(`\n  ${pass} passed, ${failures.length} failed\n`);
for (const f of failures) console.log('  ✕ ' + f + '\n');
process.exit(failures.length ? 1 : 0);
