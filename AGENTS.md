# US Presidents Quiz — Expo + React Native

An Android-first quiz app ported from the vanilla-JS web build kept in `.legacy/`.
Expo SDK 57, React Native 0.86, Expo Router, TypeScript.

Read the exact versioned Expo docs at https://docs.expo.dev/versions/v57.0.0/ before writing
any code — Expo's APIs change between SDKs.

## Layout

- `src/app/` — Expo Router routes. `index` (menu), `list`, `quiz/[mode]`.
- `src/lib/` — pure logic, ported near-verbatim from `.legacy/app.js`. **Imports nothing from
  React Native at runtime**, which is what makes `npm test` possible without a bundler.
- `src/data/presidents.ts` — the 47 records.
- `src/components/`, `src/theme/`, `src/state/`.
- `.legacy/` — the original web app, kept as the reference implementation. Not bundled.

## Commands

```
npm start                        # dev server; scan the QR with Expo Go
npm run web                      # browser
npm test                         # 63 assertions over the grading logic, zero dependencies
npx tsc --noEmit                 # typecheck
npx expo export --platform web   # static dist/ (~2MB)
eas build --profile preview      # arm64-v8a APK; profiles live in eas.json
```

`npm run lint` is wired to `expo lint`, but no ESLint config is committed — the first run
prompts to create one.

## How a quiz works

One registry drives everything: `src/lib/fields.ts`. No mode is hardcoded in the screen.

- `FieldKey = 'no' | 'name' | 'years'` — the three *typeable* things, and the only things that can
  be an answer. `FIELDS[key]: FieldSpec` carries `label`, `placeholder`, `keyboardType`, `show(p)`
  (render it as a prompt) and `check(p, v)` (grade it as an answer). UI and grading read from here.
- `GivenKey = FieldKey | 'portrait'` — what a question can *show*. A portrait is shown but never
  typed, which is exactly why it sits outside `FieldKey` and has no `FieldSpec`.
- `ModeKey = GivenKey | 'mixed'` — **a mode names the prompt.** `pickGiven(mode)` resolves it
  (`mixed` rerolls over `GIVENS` each question) and `answerFields(given)` returns `ORDER` minus
  that field. A field prompt therefore asks two answers, and a portrait — filtering nothing —
  asks all three.

A round is `Question = { rec, given, answers }` (`src/lib/quiz.ts`), and `src/app/quiz/[mode].tsx`
renders it generically: the inputs are `q.answers.map(...)` into `AnswerField`, which pulls its own
label and keyboard from `FIELDS[f]`. The prompt is `FIELDS[q.given].show(q.rec)` for a field and
`<PortraitPrompt>` for a portrait — the one place a mode is named in the screen. Adding a mode
means extending the registry and `MODE_KEYS`: the menu tile follows automatically
(`src/app/index.tsx` maps `MODE_KEYS`), and typed routes type the `mode` segment as a bare
`string`, so the route needs no change either.

`grade(q, inputs)` scores each candidate term as a unit and keeps the best-scoring one, so a
Cleveland answer that mixes #22's number with #24's years is wrong. It returns `terms: President[]`
and `RevealPanel` renders one row per term — the two-row Cleveland/Trump reveal is emergent, not
special-cased.

Session state (score, current question, inputs, result) lives in a `useReducer` inside the quiz
screen and dies on unmount. The only persisted state is the president range: `RangeContext` over
AsyncStorage under `usq.range`, plus a `?range=1-20` query param that overrides it.

## Things that will bite you

- **The navigator paints its own background.** React Navigation's default theme is an opaque
  `#f2f2f2` that hides the background photo. `contentStyle` does not reach it — the
  `ThemeProvider` value in `src/app/_layout.tsx` does.
- **Import fonts per weight** (`@expo-google-fonts/gelasio/400Regular`), never from the package
  root: the barrel re-exports all eight faces and Metro bundles every one (~850KB).
- **`src/lib/` may import RN types, never RN values.** `fields.ts` uses
  `import type { KeyboardTypeOptions }`, which is erased before the test harness sees it.
  `storage.ts` is the one real exception — it imports AsyncStorage for real, so it is the one lib
  module `tests/grading.test.ts` cannot load.
- **Only erasable TS syntax in `src/lib/`** — `node --experimental-strip-types` cannot parse
  parameter properties, enums, namespaces or decorators, and any of them would break `npm test`.
  `Deck` in `src/lib/quiz.ts` shows the workaround: declare the fields, assign in the body.
- **`npm test` has no framework and no filter.** `tests/register.mjs` installs a resolver hook
  that teaches Node the `@/*` alias and TypeScript's extensionless relative imports; the test file
  is plain top-level `check(name, actual, expected)` calls compared via `JSON.stringify`. To run a
  single case, comment out the rest — there is no `-t` flag.
- **Two different `@` aliases.** `@/*` → `src/*` and `@/assets/*` → `assets/*` (tsconfig). The
  test resolver only knows the first, so anything under `src/lib/` or `src/data/` that `require()`s
  an asset breaks `npm test` the moment the suite transitively imports it. Keep asset maps in
  `src/components/`.
- **Images go through `expo-image` and a static `require()`.** Metro needs a literal path, so
  `require('...' + n + '.jpg')` will not work — hence the 47 spelled-out lines in
  `src/components/portraits.ts`. Three of them are not `.jpg` (`10.png`, `30.jpeg`, `43.jpeg`).
- **An `expo-image` that swaps `source` needs a `recyclingKey`.** Without one the `transition`
  cross-fades the *previous* portrait into the next question, showing the last answer under the
  new prompt. See `src/components/PortraitPrompt.tsx`.
- **Neither platform scrolls a focused input into view.** Android resizes the window, iOS pads via
  `KeyboardAvoidingView`, but nothing brings the focused field above the keyboard. In portrait mode
  the photo plus three fields is tall enough that the last field sits under it and has to be
  scrolled to by hand. Known and currently accepted; fixing it means either shrinking the prompt
  while typing, scrolling on focus, or `react-native-keyboard-controller`.
- **The answer inputs are a focus chain of two *or three* fields.** Mixed alternates between them,
  so `src/app/quiz/[mode].tsx` keys the return-key wiring off `q.answers.length - 1`, not off
  index 1, and holds an array of refs that `nextQuestion` clears. The ref callback must have a
  block body — React 19 reads a returned value as a cleanup function and throws.
- **`RangePicker`'s twin-thumb slider is two fixes deep.** It is hand-built on `PanResponder`
  (core RN, so no extra dependency). Both of these are load-bearing: the responder must claim
  the gesture at *capture* phase and refuse `onPanResponderTerminationRequest`, or the enclosing
  `ScrollView` steals it and every drag degrades to a tap; and the thumbs must stay
  `pointerEvents: 'none'`, because `locationX` is measured against the event target, so a touch
  that lands on a thumb would report 0-22px and snap it to #1.
- **`src/theme/index.ts` is a translation of `.legacy/styles.css`**, not an independent design
  system. Numbers are the CSS values at a 16px root — `0.75rem` reads as `12`. Change the CSS
  reference and the theme together, and keep the `styles.css:NNN` line references honest.

## Hosting the web build

`npx expo export --platform web` writes a static `dist/` (~2MB). Static rendering emits one
HTML file per route, and the dynamic one lands as a literal `dist/quiz/[mode].html` — so
`/quiz/mixed` 404s on any plain static host unless it is rewritten. That rewrite is the whole
content of `vercel.json`; a different host needs its own equivalent.

## Grading rules worth preserving

Cleveland (#22/#24) and Trump (#45/#47) each hold two presidency numbers. When the *name* is
the prompt, either term grades as correct and the reveal lists both. Ongoing terms (`end: null`)
accept `2025-present`, `2025`, or `2025-2029`. Generational suffixes are optional, and birth
names are accepted for the four records that carry `givenName`. All of this is covered by
`tests/grading.test.ts` — run it after touching anything in `src/lib/`.
