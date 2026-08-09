import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { yearsText } from '@/lib/answers';
import type { Domain, Ruler } from '@/lib/domain';
import { cardShadow, colors, fonts, radius } from '@/theme';

/* One record as a browse card: portrait left, caption right. The proportions —
 * a card a little under 2:1, photo claiming the left 43% — are read off
 * .references/Card-Reference.png.
 *
 * The caption panel is the domain's accent rather than the reference's brown:
 * it is the largest block of colour on either domain's screen, and a brown one
 * under /ru would be the only surface in the app that ignores which quiz you are
 * in. Cream reads cleanly on both the brick and the navy. Being the accent, it
 * has to be applied inline — every StyleSheet.create runs at import, so a fill
 * declared below would bake one domain's colour into both. See AGENTS.md.
 *
 * There is no styles.css line to cite here. The legacy web build had no
 * portraits at all — its list was text rows — so this is the one surface in the
 * app with no CSS ancestor.
 *
 * **The photo does not size the card.** It is a window onto the source, not a
 * frame around it: the caption sets the height and the photo column stretches to
 * whatever that comes to, so a source of any aspect crops to fit rather than
 * pushing the card around. That is what MIN_HEIGHT is for — with nothing but two
 * lines of caption to stand on, the card would otherwise collapse to a letterbox
 * and the crop would take the top of a head. Below that floor every card is the
 * same height, which is what a column of forty-seven wants; above it, a name
 * that needs a third line gets one instead of being clipped. */
const MIN_HEIGHT = 168;
const PHOTO_WIDTH = '43%';

export function RulerCard({
  domain,
  rec,
  withNumber,
  style,
}: {
  domain: Domain;
  rec: Ruler;
  /** Numbered under /us, where the presidency number is part of the record's
   *  identity; bare under /ru, which never shows a number. */
  withNumber: boolean;
  /** For the caller that lays several of these out: two side by side square off
   *  at the bottom only if the shorter one is told to grow. */
  style?: StyleProp<ViewStyle>;
}) {
  // A domain whose portraits have not been sourced renders the empty well
  // rather than crashing — the same bargain PortraitPrompt makes.
  const source = domain.portraits[rec.no];

  return (
    <View style={[styles.card, { backgroundColor: domain.accent }, style]}>
      <View style={styles.photo}>
        {source ? (
          <Image
            source={source}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            /* Pinned to the top for the same reason as the quiz prompt: the face
             * sits high in every source, and a centred crop cuts foreheads. */
            contentPosition="top center"
            cachePolicy="memory-disk"
            transition={120}
            accessible
            accessibilityRole="image"
            /* Named here, unlike in the quiz prompt — this screen is a browse,
             * and the name is printed alongside anyway. */
            accessibilityLabel={rec.name}
          />
        ) : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.name}>{withNumber ? `${rec.no}. ${rec.name}` : rec.name}</Text>
        <Text style={styles.years}>{yearsText(rec, domain.strings.present)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    // No height and no aspect ratio: the panel's content is the only thing that
    // sets it, and `alignItems` stays at its default stretch so the photo column
    // follows.
    minHeight: MIN_HEIGHT,
    borderRadius: radius.card,
    // Clips the photo into the two left corners. It takes the shadow with it on
    // iOS, exactly as it does on the list's own card — the elevation on Android
    // is unaffected.
    overflow: 'hidden',
    ...cardShadow,
  },
  // Width fixed, height inherited from the row's stretch — never from the image.
  photo: { width: PHOTO_WIDTH, backgroundColor: colors.paperWarm },

  panel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  name: {
    fontFamily: fonts.serifBold,
    fontSize: 19,
    lineHeight: 25,
    textAlign: 'center',
    color: colors.paperWarm,
  },
  years: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    textAlign: 'center',
    // The cream at rather less than full strength: the years are a caption under
    // the name, not a second heading beside it.
    color: 'rgba(242, 238, 228, 0.82)',
    fontVariant: ['tabular-nums'],
  },
});
