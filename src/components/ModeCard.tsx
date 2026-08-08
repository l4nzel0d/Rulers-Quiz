import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors, fonts, radius, spacing, type } from '@/theme';

export function ModeCard({
  title,
  blurb,
  onPress,
}: {
  title: string;
  blurb: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${blurb}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.blurb}>{blurb}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    ...cardShadow,
  },
  // Replaces the web build's :hover lift and :active nudge.
  pressed: { transform: [{ translateY: 1 }], borderColor: colors.brick, opacity: 0.92 },
  title: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink, marginBottom: 2 },
  blurb: { ...type.small, color: colors.stone },
  chevron: { fontSize: 26, color: colors.terracotta, lineHeight: 30 },
});
