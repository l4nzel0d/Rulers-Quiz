import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/theme';

type Props = {
  title: string;
  /** Shows a back affordance. Android's hardware back still works regardless. */
  showBack?: boolean;
  right?: ReactNode;
};

export function AppBar({ title, showBack, right }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
      ) : null}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  backGlyph: { fontSize: 24, color: colors.brown, lineHeight: Platform.OS === 'ios' ? 28 : 26 },
  pressed: { opacity: 0.5 },
  title: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 19,
    color: colors.brick,
    letterSpacing: 0.2,
  },
  right: { minWidth: 0 },
});
