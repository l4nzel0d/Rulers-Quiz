import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { cardShadow, colors, radius } from '@/theme';

/** The shared surface behind .card / .mode / .rows / .range — styles.css:128. */
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export const surface = {
  backgroundColor: colors.card,
  borderRadius: radius.card,
  borderWidth: 1,
  borderColor: colors.line,
} as const;

const styles = StyleSheet.create({
  card: { ...surface, ...cardShadow },
});
