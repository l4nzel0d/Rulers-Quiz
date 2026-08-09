import { forwardRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';

import { useAccent } from '@/state/DomainContext';
import { colors, radius } from '@/theme';

/* .btn — styles.css:541. `font: inherit` there means the system sans, not the
 * serif: the buttons are the one place the web build stays deliberately plain. */

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'quiet';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/* The ref is what lets the quiz screen move web focus onto "Next question"
 * after a grade; react-native-web renders the Pressable as a tabbable
 * role="button" and turns Enter/Space on it into a press. */
export const Button = forwardRef<View, Props>(function Button(
  { label, onPress, variant = 'primary', disabled, style },
  ref
) {
  const primary = variant === 'primary';
  const accent = useAccent();
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.quiet,
        primary && { backgroundColor: accent, shadowColor: accent },
        // Replaces the web build's :active { transform: translateY(1px) }.
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, primary ? styles.labelPrimary : styles.labelQuiet]}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: 48, // the web build's 0.8rem padding, floored to a touch target
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.brick,
    // styles.css:559 — box-shadow: 0 2px 8px rgba(138, 52, 38, 0.28)
    ...Platform.select({
      android: { elevation: 2 },
      default: {
        shadowColor: colors.brick,
        shadowOpacity: 0.28,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  quiet: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.tan },
  pressed: { transform: [{ translateY: 1 }], opacity: 0.9 },
  disabled: { opacity: 0.45 },
  label: { fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  labelPrimary: { color: colors.paper },
  labelQuiet: { color: colors.ink },
});
