import { Pressable, StyleSheet, Text } from 'react-native';

import { type } from '@/theme';

/** .browse — styles.css:115. The web build's understated text links: "Browse
 *  all 47 terms →" on the menu, "← Back to modes" at the foot of the others. */
export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={10}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', paddingVertical: 4 },
  // Replaces the web build's :hover underline.
  pressed: { opacity: 0.6 },
  label: type.link,
});
