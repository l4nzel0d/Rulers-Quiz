import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, type, useLayout } from '@/theme';

/* .bar — styles.css:81. Brand on the left, score on the right, sitting on a
 * 2px brick rule. The brand is the web build's link home; Android's hardware
 * back and the "Back to modes" link at the foot of each screen cover the rest,
 * which is why there is no back chevron here. */

export function AppBar({ score }: { score?: { right: number; asked: number } }) {
  const insets = useSafeAreaInsets();
  const { maxWidth, gutter } = useLayout();

  return (
    <View style={[styles.outer, { paddingTop: insets.top + 8, paddingHorizontal: gutter }]}>
      <View style={[styles.bar, { maxWidth }]}>
        <Pressable
          onPress={() => router.navigate('/')}
          accessibilityRole="link"
          accessibilityLabel="US Presidents Quiz, back to modes"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.brand}>US Presidents Quiz</Text>
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
