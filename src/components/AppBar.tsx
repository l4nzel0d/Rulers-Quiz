import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOptionalDomain } from '@/state/DomainContext';
import { colors, type, useLayout } from '@/theme';

/* .bar — styles.css:81. Brand on the left, score on the right, sitting on a
 * 2px accent rule. The brand is the web build's link home; Android's hardware
 * back and the "Back to modes" link at the foot of each screen cover the rest,
 * which is why there is no back chevron here.
 *
 * Brand, accent and destination all come from the surrounding domain, so the
 * chooser above them falls back to the app's own name. */

export function AppBar({ score }: { score?: { right: number; asked: number } }) {
  const insets = useSafeAreaInsets();
  const { maxWidth, gutter } = useLayout();
  const domain = useOptionalDomain();

  const brand = domain?.brand ?? 'Rulers Quiz';
  const accent = domain?.accent ?? colors.brick;
  // Spelled out rather than built from the key, so typed routes keep checking it.
  const home = domain?.key === 'us' ? '/us' : domain?.key === 'ru' ? '/ru' : '/';

  return (
    <View style={[styles.outer, { paddingTop: insets.top + 8, paddingHorizontal: gutter }]}>
      <View style={[styles.bar, { maxWidth }, { borderBottomColor: accent }]}>
        <Pressable
          onPress={() => router.navigate(home)}
          accessibilityRole="link"
          accessibilityLabel={brand}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={[styles.brand, { color: accent }]}>{brand}</Text>
        </Pressable>

        {score ? (
          <Text style={styles.score}>
            {score.right} / {score.asked}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center' },
  bar: {
    width: '100%',
    flexDirection: 'row',
    // Baseline alignment, as in the web build, so the score sits on the brand's
    // line rather than centred against its taller serif box.
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.brick,
  },
  pressed: { opacity: 0.6 },
  brand: type.brand,
  score: { ...type.score, fontVariant: ['tabular-nums'] },
});
