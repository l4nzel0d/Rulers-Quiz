# Rulers Quiz — Expo + React Native

An Android-first quiz app ported from the vanilla-JS web build kept in `.legacy/`.
Expo SDK 57, React Native 0.86, Expo Router, TypeScript.

It carries **two domains**: US presidents (English, at `/us`) and Russian rulers (Russian, at
`/ru`). They share one engine, one component set and one test suite; a chooser sits at `/`.

Read the exact versioned Expo docs at https://docs.expo.dev/versions/v57.0.0/ before writing
any code — Expo's APIs change between SDKs.

## Layout

- `src/app/` — Expo Router routes only. `index` (chooser), then `us/` and `ru/`, each with
  `_layout`, `index` (menu), `list` and `quiz/[mode]`. Every route file is a wrapper a few lines
  long; the screens themselves live in `src/screens/`.
- `src/screens/` — `MenuScreen`, `ListScreen`, `QuizScreen`. Shared by both domains, which they
  read from context. No domain is named in them beyond the two `key === 'us' ? … : …` route
  literals that typed routes require.
- `src/lib/` — pure logic. **Imports nothing from React Native at runtime**, which is what makes
  `npm test` possible without a bundler. `domain.ts` is the vocabulary every domain fills in.
- `src/domains/` — the two registries. `us-core.ts` / `ru-core.ts` are pure and testable;
  `us.ts` / `ru.ts` add the images on top.
- `src/data/us-presidents.ts` (47 records) and `src/data/ru-rulers.ts` (31).
- `src/components/`, `src/theme/`, `src/state/`.
- `.legacy/` — the original web app, kept as the reference implementation. Not bundled.

## Commands

```
npm start                        # dev server — needs a dev client, NOT Expo Go (see below)
npm run web                      # browser
npm test                         # 127 assertions over both domains, zero dependencies
npx tsc --noEmit                 # typecheck
npx expo export --platform web   # static dist/
eas build --profile preview      # arm64-v8a APK; profiles live in eas.json
```

`npm run lint` is wired to `expo lint`, but no ESLint config is committed — the first run
prompts to create one.

## How a quiz works

One registry drives everything, and there is one registry per domain: `DomainCore` in
`src/lib/domain.ts`, filled in by `src/domains/{us,ru}-core.ts`. No mode and no language is
hardcoded in any screen.

- `FieldKey = 'no' | 'name' | 'years'` — the *typeable* things, and the only things that can be
  an answer. `fields[key]: FieldSpec` carries `label`, `placeholder`, `keyboardType`, `show(r)`
  (render it as a prompt) and `check(r, v)` (grade it as an answer). UI and grading read from here.
- `GivenKey = FieldKey | 'portrait'` — what a question can *show*. A portrait is shown but never
  typed, which is exactly why it sits outside `FieldKey` and has no `FieldSpec`.
- `ModeKey = GivenKey | 'mixed'` — **a mode names the prompt.** `pickGiven(domain, mode)` resolves
  it (`mixed` rerolls over `domain.givens`) and `answerFields(domain, given)` returns
  `domain.order` minus that field.
- **A domain narrows those unions rather than changing them.** `/ru` never shows a number, so
  `order` is `['name','years']`, and `givens`/`modeKeys` omit `'no'`. A field prompt therefore
  asks two answers under `/us` and one under `/ru`; a portrait, filtering nothing, asks three and
  two. `fields` stays total over `FieldKey` on purpose — `fields[given]` then needs no null check,
  and `ru-core.ts` carries a `no` spec that nothing ever reads.

A round is `Question = { rec, given, answers }` (`src/lib/quiz.ts`), and `src/screens/QuizScreen.tsx`
renders it generically: the inputs are `q.answers.map(...)` into `AnswerField`, which is handed
`domain.fields[f]` and pulls its own label and keyboard from it. The prompt is
`domain.fields[q.given].show(q.rec)` for a field and `<PortraitPrompt>` for a portrait — the one
place a mode is named in the screen. Adding a mode means extending a domain's registry and
`modeKeys`: the menu tile follows automatically (`MenuScreen` maps `domain.modeKeys`), and typed
routes type the `mode` segment as a bare `string`, so the route needs no change either.

`grade(domain, q, inputs)` scores each candidate term as a unit and keeps the best-scoring one, so
a Cleveland answer that mixes #22's number with #24's years is wrong. It returns `terms: Ruler[]`
and `RevealPanel` renders one row per term — the two-row Cleveland/Trump/Putin reveal is emergent,
not special-cased.

Session state (score, current question, inputs, result) lives in a `useReducer` inside the quiz
screen and dies on unmount. The only persisted state is the range: `RangeContext` over
AsyncStorage under `usq.range.<domain>`, plus a `?range=1-20` query param that overrides it.

That range is a `Selection` — a *list* of spans, not a pair of bounds, because `/ru`'s chips are
a set and «Романовы + Россия» has a hole in it. `makeSelection` is the only constructor: it
clamps, sorts and merges spans that overlap **or touch**, so two neighbouring eras become the one
run of `no` they are and every consumer can compare shapes without re-merging. Names survive that
merge because `selectionText` reads *coverage* rather than shape — 20-31 still prints «Советский
период + Россия», and the same lookup lights both chips.

## Things that will bite you

- **A native module means no Expo Go.** `react-native-keyboard-controller` is linked in, so
  `npm start` needs a dev client (`expo-dev-client` is already a dependency). On web its bindings
  are safe no-ops, so `KeyboardAwareScrollView` degrades to a plain `ScrollView`.
- **The domain is a context, never a module-level "current domain".** Static web export renders
  every route in one Node process, so a mutable global would let `/us` and `/ru` bleed into each
  other's HTML. See `src/state/DomainContext.tsx`.
- **The accent colour cannot live in a StyleSheet.** Every `StyleSheet.create` runs at import, so
  `colors.brick` would bake the US red into both domains. `useAccent()` supplies
  `domain.accent` and the ~14 sites that need it apply it as an inline override. The chooser has
  no domain and falls back to `colors.brick`.
- **A running dev server poisons `.expo/types/router.d.ts`.** While it watches, the typed-routes
  generator adds files you edit *anywhere* under `src/` to the route union as
  `/../screens/QuizScreen`, `/../domains/ru-core` and so on. The typecheck then rejects perfectly
  good `router.navigate('/us')` calls, because the real routes get crowded out. The fix is
  mechanical and will be needed again: stop the dev server, `rm -rf .expo/types`, start it once,
  let the file regenerate, and typecheck without editing in between.
- **The navigator paints its own background.** React Navigation's default theme is an opaque
  `#f2f2f2` that hides the background photo. `contentStyle` does not reach it — the
  `ThemeProvider` value in `src/app/_layout.tsx` does.
- **`Background` sits outside `RangeProvider`.** That provider withholds its subtree until the
  stored range is read, so anything inside it flashes empty on entry to a domain.
- **Import fonts per weight** (`@expo-google-fonts/gelasio/400Regular`), never from the package
  root: the barrel re-exports all eight faces and Metro bundles every one (~850KB).
- **`src/lib/` may import RN types, never RN values.** `domain.ts` uses
  `import type { ImageSourcePropType, KeyboardTypeOptions }`, which is erased before the test
  harness sees it. `storage.ts` is the one real exception — it imports AsyncStorage for real, so
  it is the one lib module `tests/grading.test.ts` cannot load.
- **Only erasable TS syntax in `src/lib/`** — `node --experimental-strip-types` cannot parse
  parameter properties, enums, namespaces or decorators, and any of them would break `npm test`.
  `Deck` in `src/lib/quiz.ts` shows the workaround: declare the fields, assign in the body.
- **`npm test` has no framework and no filter.** `tests/register.mjs` installs a resolver hook
  that teaches Node the `@/*` alias and TypeScript's extensionless relative imports; the test file
  is plain top-level `check(name, actual, expected)` calls compared via `JSON.stringify`. To run a
  single case, comment out the rest — there is no `-t` flag.
- **Two different `@` aliases.** `@/*` → `src/*` and `@/assets/*` → `assets/*` (tsconfig). The
  test resolver only knows the first, and it appends `.ts` to whatever follows — so it cannot
  resolve a directory index either. This is the whole reason each domain is split in two: the
  suite imports `@/domains/us-core`, never `@/domains/us`, which would drag in the portrait map.
  Keep asset maps in `src/components/`.
- **Images go through `expo-image` and a static `require()`.** Metro needs a literal path, so
  `require('...' + n + '.jpg')` will not work — hence the 47 spelled-out lines in
  `src/components/us-portraits.ts`. Three of them are not `.jpg` (`10.png`, `30.jpeg`, `43.jpeg`).
  `src/components/ru-portraits.ts` is still empty; a missing entry renders an empty frame rather
  than crashing.
- **An `expo-image` that swaps `source` needs a `recyclingKey`.** Without one the `transition`
  cross-fades the *previous* portrait into the next question, showing the last answer under the
  new prompt. See `src/components/PortraitPrompt.tsx`.
- **`FieldSpec.keyboardType` is not portable, and the domain can't fix it.** The years field wants
  digits *and* a `-`, which on iOS is `numbers-and-punctuation` — a name no other platform knows.
  Android falls through to `TYPE_CLASS_TEXT` and web to `type="text"`, so the field came up
  alphabetic on both. `AnswerField.resolveKeyboard` substitutes **per platform**, and the two
  substitutes differ. Android takes `'phone-pad'`, not `'numeric'`: `'numeric'` carries
  `TYPE_NUMBER_FLAG_SIGNED`, and Android's digits key listener then takes a `-` only in first
  position, which makes `1762-1796` untypeable, while `'phone-pad'` is `TYPE_CLASS_PHONE`, whose
  dialer key listener takes it anywhere. Web takes `'default'` — plain `type="text"` — because
  `'phone-pad'` becomes `type="tel"` there and mobile Safari answers that with the dial pad:
  digits and a `+ * #` page, no `-`, no space, no letters, so neither `1762-1796` nor `present` /
  «н. в.» can be typed at all. No inputmode offers digits *and* punctuation on iOS (`numeric` and
  `decimal` are narrower; `type="number"` would reject the value), so the text keyboard, where `-`
  is one page away, is the best available. The mapping cannot live in `src/domains/*-core.ts`,
  because `npm test` imports those and they may not touch a react-native *value* such as
  `Platform`.
- **The answer inputs are a focus chain of one, two *or three* fields.** Mixed alternates between
  them, so `QuizScreen` keys the return-key wiring off `q.answers.length - 1`, not off index 1,
  and holds an array of refs that `nextQuestion` clears. The ref callback must have a block body —
  React 19 reads a returned value as a cleanup function and throws.
- **`domain.slider` decides what a chip *is*.** Where the slider owns the range (`/us`) a chip is
  a shortcut into it and replaces the span — the slider cannot draw a gap, so it must never be
  handed one, and `parseSelectionIn` keeps only the first span of a hand-edited multi-span URL
  under such a domain. Where the chips are the whole control (`/ru`) they toggle, and any
  combination of eras is reachable. Switching the last one off is refused: an empty selection is
  an empty pool, and a chip that answered a tap by selecting everything would be worse than one
  that stays lit.
- **`RangePicker`'s twin-thumb slider is two fixes deep**, and optional. `/ru` sets
  `slider: false` and the chips become the whole control. It is hand-built on `PanResponder`
  (core RN, so no extra dependency). Both of these are load-bearing: the responder must claim
  the gesture at *capture* phase and refuse `onPanResponderTerminationRequest`, or the enclosing
  `ScrollView` steals it and every drag degrades to a tap; and the thumbs must stay
  `pointerEvents: 'none'`, because `locationX` is measured against the event target, so a touch
  that lands on a thumb would report 0-22px and snap it to the first record.
- **Both domains index on the same `no` space.** In storage and in the URL a range is bare
  integers in pairs — `20-27`, or `1-19,28-31` once the chips hold a set — so anything arriving
  from outside goes through `parseSelectionIn(domain, …)`, which clamps. The single-span form
  written by earlier builds still parses, which is what keeps old links and stored values working.
  Storage keys are per domain for the same reason.
- **`src/theme/index.ts` is a translation of `.legacy/styles.css`**, not an independent design
  system. Numbers are the CSS values at a 16px root — `0.75rem` reads as `12`. Change the CSS
  reference and the theme together, and keep the `styles.css:NNN` line references honest.

## Hosting the web build

`npx expo export --platform web` writes a static `dist/`. Static rendering emits one HTML file
per route, and the dynamic ones land as literal `dist/us/quiz/[mode].html` and
`dist/ru/quiz/[mode].html` — so `/us/quiz/mixed` 404s on any plain static host unless it is
rewritten. Those two rewrites are the whole content of `vercel.json`; a different host needs its
own equivalent. The pre-domain `/quiz/:mode` URLs were a deliberate clean break and are not
redirected.

## Grading rules worth preserving

- **Repeat holders.** Cleveland (#22/#24) and Trump (#45/#47) each hold two presidency numbers,
  and Putin holds two spans under `/ru`. When the *name* is the prompt, either term grades as
  correct and the reveal lists both. A portrait pins the answer to its own term.
- **Ongoing terms** (`end: null`) accept the open form in the domain's own words, the bare start
  year, or the record's `scheduledEnd`. That last one is a field, not a `start + 4` guess — US
  terms run four years and Russian ones six.
- **Suffixes and numerals are required.** There is no suffix-dropping anywhere in the app:
  "Barack Hussein Obama" is rejected for #44, and Николай I is rejected for Николай II. The same
  rule reads as strictness in English and as plain correctness in Russian.
- **Normalisation is Unicode-aware** (`/[^\p{L}\p{N}]/gu`), and folds `ё` to `е`. The ASCII-only
  predecessor reduced every Cyrillic name to the empty string.
- **Birth names and aliases.** `givenName` is displayed ("born X" / «Настоящее имя — X») and
  accepted; `aliases` are accepted and never displayed. An alias must identify exactly one
  record — that is why «Екатерина Алексеевна» belongs to neither Екатерина.

All of this is covered by `tests/grading.test.ts` — run it after touching anything in `src/lib/`
or `src/domains/`.
