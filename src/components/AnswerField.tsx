import { forwardRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
} from 'react-native';

import type { FieldSpec } from '@/lib/domain';
import { colors, radius } from '@/theme';

/* .field — styles.css:442. The label is plain sentence-case body copy, not the
 * small-caps eyebrow; grading appends " ✓" / " ✕" to it and recolours the well,
 * as in styles.css:476-480. */

type Props = {
  /** The field's own spec, handed down by the domain — the label, placeholder
   *  and keyboard all come from there, so this component names no field. */
  spec: FieldSpec;
  value: string;
  onChangeText: (v: string) => void;
  /** null while unanswered; true/false once graded. */
  mark: boolean | null;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
};

/* 'numbers-and-punctuation' is an iOS-only keyboardType: it is the one keyboard
 * that offers digits and a '-' at once, so the years field asks for it. Nothing
 * else recognises the name — Android's ReactTextInputManager falls through to
 * TYPE_CLASS_TEXT and react-native-web to type="text", which is why the years
 * field came up with a letter keyboard on both.
 *
 * The Android substitute is 'phone-pad', not 'numeric'. 'numeric' maps to
 * TYPE_CLASS_NUMBER | DECIMAL | SIGNED, and Android's digits key listener then
 * accepts a '-' only in first position — "1762-1796" would be untypeable.
 * 'phone-pad' is TYPE_CLASS_PHONE, whose dialer key listener takes '-'
 * anywhere.
 *
 * Web must NOT take that substitute, however tempting the symmetry: react-
 * native-web turns 'phone-pad' into type="tel", and mobile Safari answers a
 * tel input with the dial pad — ten digits and a '+ * #' page, with no '-', no
 * space and no letters at all. The whole two-year answer, and "present" /
 * «н. в.» with it, becomes untypeable. Nothing in the inputmode vocabulary
 * gives digits *and* punctuation there ('numeric' and 'decimal' are narrower
 * still, and type="number" would reject the value), so the honest fallback is
 * the plain text keyboard: '-' is one page away rather than absent. Desktop
 * has a real keyboard and never notices; Android web trades its dial pad for
 * the same page turn.
 *
 * This has to live here rather than in the domain: `src/domains/*-core.ts` is
 * imported by `npm test` and may not touch a react-native *value* like
 * Platform. Keyed off the keyboard, not the field, so it names no field. */
function resolveKeyboard(t: KeyboardTypeOptions | undefined): KeyboardTypeOptions | undefined {
  if (t !== 'numbers-and-punctuation') return t;
  if (Platform.OS === 'android') return 'phone-pad';
  if (Platform.OS === 'web') return 'default';
  return t;
}

export const AnswerField = forwardRef<TextInput, Props>(function AnswerField(
  { spec, value, onChangeText, mark, autoFocus, returnKeyType, onSubmitEditing },
  ref
) {
  const graded = mark !== null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {spec.label}
        {graded ? <Text style={mark ? styles.ok : styles.bad}>{mark ? ' ✓' : ' ✕'}</Text> : null}
      </Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        editable={!graded}
        placeholder={spec.placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={resolveKeyboard(spec.keyboardType)}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        submitBehavior="submit"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="words"
        style={[styles.input, graded && (mark ? styles.inputOk : styles.inputBad)]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 }, // 0.35rem
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  ok: { color: colors.ok },
  bad: { color: colors.bad },
  input: {
    minHeight: 46,
    paddingVertical: 11,
    paddingHorizontal: 13,
    fontSize: 16, // >=16 stops iOS zoom-on-focus, as in the web build
    color: colors.ink,
    backgroundColor: colors.paperWarm,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.tan,
  },
  inputOk: { borderColor: colors.ok, backgroundColor: colors.okBg },
  inputBad: { borderColor: colors.bad, backgroundColor: colors.badBg },
});
