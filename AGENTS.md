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
npm start          # dev server; scan the QR with Expo Go
npm run web        # browser
npm test           # 48 assertions over the grading logic, zero dependencies
npx tsc --noEmit   # typecheck
```

## Things that will bite you

- **The navigator paints its own background.** React Navigation's default theme is an opaque
  `#f2f2f2` that hides the background photo. `contentStyle` does not reach it — the
  `ThemeProvider` value in `src/app/_layout.tsx` does.
- **Import fonts per weight** (`@expo-google-fonts/gelasio/400Regular`), never from the package
  root: the barrel re-exports all eight faces and Metro bundles every one (~850KB).
- **Percentage widths inside a `FlatList` cell** resolve against the shrink-wrapped cell. Put
  the width cap on the list's `style`, not its `contentContainerStyle`.
- **No TS parameter properties** in `src/lib/` — `node --experimental-strip-types` cannot parse
  them, and that would break `npm test`.

## Grading rules worth preserving

Cleveland (#22/#24) and Trump (#45/#47) each hold two presidency numbers. When the *name* is
the prompt, either term grades as correct and the reveal lists both. Ongoing terms (`end: null`)
accept `2025-present`, `2025`, or `2025-2029`. Generational suffixes are optional, and birth
names are accepted for the four records that carry `givenName`. All of this is covered by
`tests/grading.test.ts` — run it after touching anything in `src/lib/`.
