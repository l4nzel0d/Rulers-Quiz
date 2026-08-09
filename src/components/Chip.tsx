import { Pressable, StyleSheet, Text, type AccessibilityRole } from 'react-native';

import { useAccent } from '@/state/DomainContext';
import { colors, radius } from '@/theme';

/* .chip — styles.css:318. A pill that is either lit or not.
 *
 * The range picker's era presets were the only chips for a while and owned these
 * styles privately; the list screen's view toggle is the second, so they live
 * here now. What a lit chip *means* is the caller's business — a preset is a
 * button under /us and a checkbox under /ru, and the view toggle is a radio —
 * so the role comes in as a prop and only the look is shared.
 *
 * The accent fill is applied inline, not in the StyleSheet: every
 * StyleSheet.create runs at import, which would bake one domain's colour into
 * both. See AGENTS.md. */
export function Chip({
  label,
  on,
  onPress,
  accessibilityRole = 'button',
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  accessibilityRole?: AccessibilityRole;
}) {
  const accent = useAccent();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected: on, checked: on }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        on && [styles.chipOn, { backgroundColor: accent }],
        pressed && { borderColor: accent },
      ]}>
      <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.tan,
    backgroundColor: colors.chip,
  },
  chipOn: { borderColor: 'transparent' },
  chipLabel: { fontSize: 13, fontWeight: '600', color: colors.brown },
  chipLabelOn: { color: colors.paper },
});
