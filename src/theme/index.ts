import { Platform } from 'react-native';

/* Palette pulled from the weathered-flag background, carried over verbatim from
 * the web build's CSS custom properties. */
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

  /** Card fill. Replaces the web build's backdrop-filter blur, which costs far
   *  more on Android than a translucent solid is worth here. */
  card: 'rgba(242, 238, 228, 0.86)',
  cardBorder: 'rgba(145, 89, 69, 0.28)',
} as const;

/** The readability scrim over the photo. The web build used a radial gradient
 *  centred at 50% 0%; React Native has no radial gradient, so this runs the
 *  same three stops top-to-bottom. */
export const scrim = {
  colors: ['rgba(232,227,214,0.58)', 'rgba(232,227,214,0.86)', 'rgba(201,186,158,0.92)'] as const,
  locations: [0, 0.7, 1] as const,
};

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const fonts = {
  /** Bundled Gelasio — metric-compatible with Georgia, the last real entry in
   *  the web build's serif stack. Palatino does not exist on Android. */
  serif: 'Gelasio_400Regular',
  serifBold: 'Gelasio_700Bold',
  /** System UI font: Roboto on Android, SF on iOS — same as the web build. */
  body: Platform.select({ ios: 'System', default: 'sans-serif' }),
} as const;

export const type = {
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34, color: colors.ink },
  heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, color: colors.ink },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink },
  small: { fontSize: 13, lineHeight: 18, color: colors.stone },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 0.8, color: colors.brown },
} as const;

/** iOS takes the layered shadow; Android only understands elevation. */
export const cardShadow = Platform.select({
  ios: {
    shadowColor: '#4a2f22',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 3 },
  default: {},
});

export const MAX_CONTENT_WIDTH = 560;
