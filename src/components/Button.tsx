import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'quiet';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.quiet,
        // Replaces the web build's :active { transform: translateY(1px) }.
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, primary ? styles.labelPrimary : styles.labelQuiet]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52, // comfortable touch target
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.brick },
  quiet: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: { transform: [{ translateY: 1 }], opacity: 0.88 },
  disabled: { opacity: 0.45 },
  label: { fontFamily: fonts.serif, fontSize: 17, letterSpacing: 0.3 },
  labelPrimary: { color: colors.paperWarm },
  labelQuiet: { color: colors.brown },
});
