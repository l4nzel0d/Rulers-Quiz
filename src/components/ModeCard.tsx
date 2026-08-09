import { Pressable, StyleSheet, Text } from 'react-native';

import { surface } from '@/components/Card';
import { useAccent } from '@/state/DomainContext';
import { cardShadow, colors, fonts } from '@/theme';

/** .mode — styles.css:148. A stacked title and blurb, no chevron: the whole
 *  card is the target, exactly as the web build's anchor was. */
export function ModeCard({
  title,
  blurb,
  onPress,
}: {
  title: string;
  blurb: string;
  onPress: () => void;
}) {
  const accent = useAccent();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${blurb}`}
      style={({ pressed }) => [styles.card, pressed && [styles.pressed, { borderColor: accent }]]}>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <Text style={styles.blurb}>{blurb}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surface,
    ...cardShadow,
    flex: 1,
    gap: 3,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  // Replaces the web build's :hover border lift and :active nudge.
  pressed: { transform: [{ translateY: 1 }], borderColor: colors.brick },
  title: { fontFamily: fonts.serifBold, fontSize: 17, color: colors.brick },
  blurb: { fontSize: 14, lineHeight: 20, color: colors.muted },
});
