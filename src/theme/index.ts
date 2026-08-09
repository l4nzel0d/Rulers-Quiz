import { Platform, useWindowDimensions } from 'react-native';

/* A direct translation of .legacy/styles.css. Values are the CSS ones converted
 * at the browser's 16px root, so `0.75rem` reads as 12 here. Where a number
 * looks arbitrary it is almost always a rem in disguise. */

/* Palette pulled from the weathered-flag background — styles.css:1-26, verbatim. */
export const colors = {
  paper: '#e8e3d6', // aged cream
  paperWarm: '#f2eee4', // lifted cream, for input wells
  tan: '#ccbfa6',
  brick: '#8a3426', // the flag's red — primary accent
  terracotta: '#ab7661',
  brown: '#915945',
  khaki: '#a79270',
  stone: '#6e6c66',

  // derived text tones — the palette has no ink dark enough for body copy
  ink: '#2f2721',
  muted: '#2c2d2c',

  line: 'rgba(145, 89, 69, 0.28)',
  lineSolid: '#d9cfba',

  ok: '#4c5c37',
  okBg: '#dde2ca',
  bad: '#8a3426',
  badBg: '#f0dbd4',

  /** The shared card fill (styles.css:132). The web build layered a 3px
   *  backdrop blur under it; that costs far more on Android than it is worth
   *  under a static photo, so only the translucent fill carries over. */
  card: 'rgba(242, 238, 228, 0.92)',

  /** Zebra striping on the record list — styles.css:369. */
  rowAlt: 'rgba(204, 191, 166, 0.22)',

  /** Preset chip fill — styles.css:330. */
  chip: 'rgba(232, 227, 214, 0.7)',

  okBorder: 'rgba(76, 92, 55, 0.45)',
  badBorder: 'rgba(138, 52, 38, 0.4)',

  placeholder: '#9a8f7d',
} as const;

/** The readability scrim over the photo. The web build used a radial gradient
 *  centred at 50% 0% (styles.css:56-62); React Native has no radial gradient, so
 *  this runs the same three stops top-to-bottom. */
export const scrim = {
  colors: ['rgba(232,227,214,0.58)', 'rgba(232,227,214,0.86)', 'rgba(201,186,158,0.92)'] as const,
  locations: [0, 0.7, 1] as const,
};

/** The chooser's own ground. It sits above both domains, so it has no domain
 *  photo to stand on and paints this instead of the scrim. The stops walk the
 *  palette from `paperWarm` through `tan` and end between `tan` and
 *  `terracotta`, so the ground warms toward the brick accent without ever
 *  darkening far enough to fight the cards' translucent cream. */
export const chooserGradient = {
  colors: ['#f2eee4', '#ddd2ba', '#c0a48d'] as const,
  locations: [0, 0.55, 1] as const,
};

/** --radius is 14px for surfaces; inputs, buttons and the reveal use 10. */
export const radius = { input: 10, card: 14, pill: 999 } as const;

export const fonts = {
  /** Bundled Gelasio — metric-compatible with Georgia, the last real entry in
   *  the web build's serif stack. Palatino does not exist on Android. */
  serif: 'Gelasio_400Regular',
  /** Every serif run in the web build is font-weight 700. */
  serifBold: 'Gelasio_700Bold',
  /** System UI font: Roboto on Android, SF on iOS — matches styles.css:37. */
  body: Platform.select({ ios: 'System', default: 'sans-serif' }),
} as const;

export const type = {
  /** .brand — styles.css:90 */
  brand: { fontFamily: fonts.serifBold, fontSize: 19, letterSpacing: 0.2, color: colors.brick },
  /** .score — styles.css:101 */
  score: { fontSize: 15, fontWeight: '600', color: colors.stone },
  /** .lede — styles.css:109 */
  lede: { fontSize: 15, lineHeight: 22, color: colors.muted },
  /** .range-title / .mode-tag / .given-label / .verdict — the small caps run */
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.brown,
  },
  /** body copy — styles.css:37 */
  body: { fontSize: 16, lineHeight: 24, color: colors.ink },
  small: { fontSize: 13, lineHeight: 19, color: colors.muted },
  /** .browse — styles.css:115 */
  link: { fontSize: 14, fontWeight: '600', color: colors.brown },
} as const;

/** iOS takes the layered box-shadow from styles.css:135; Android only
 *  understands elevation. */
export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#2f2721',
    shadowOpacity: 0.12,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 3 },
  default: {},
});

/** .app is max-width 34rem, widening to 40rem past the 40rem breakpoint. */
export const MAX_CONTENT_WIDTH = 544;
export const MAX_CONTENT_WIDTH_WIDE = 640;
/** styles.css:579 — @media (min-width: 40rem) */
export const WIDE_BREAKPOINT = 640;

/** The web build's `body { padding: 1rem }`, doubling past the breakpoint. */
export function useLayout() {
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  return {
    wide,
    maxWidth: wide ? MAX_CONTENT_WIDTH_WIDE : MAX_CONTENT_WIDTH,
    gutter: wide ? 32 : 16,
  };
}
