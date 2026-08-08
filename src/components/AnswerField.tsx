import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type ReturnKeyTypeOptions } from 'react-native';

import { FIELDS, type FieldKey } from '@/lib/fields';
import { colors, radius, spacing, type } from '@/theme';

type Props = {
  field: FieldKey;
  value: string;
  onChangeText: (v: string) => void;
  /** null while unanswered; true/false once graded. */
  mark: boolean | null;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
};

export const AnswerField = forwardRef<TextInput, Props>(function AnswerField(
  { field, value, onChangeText, mark, autoFocus, returnKeyType, onSubmitEditing },
  ref
) {
  const spec = FIELDS[field];
  const graded = mark !== null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, graded && (mark ? styles.labelOk : styles.labelBad)]}>
        {spec.label}
        {graded ? (mark ? ' ✓' : ' ✕') : ''}
      </Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        editable={!graded}
        placeholder={spec.placeholder}
        placeholderTextColor={colors.khaki}
        keyboardType={spec.keyboardType}
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
  wrap: { gap: spacing.xs },
  label: { ...type.label, textTransform: 'uppercase' },
  labelOk: { color: colors.ok },
  labelBad: { color: colors.bad },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 17,
    color: colors.ink,
    backgroundColor: colors.paperWarm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineSolid,
  },
  inputOk: { borderColor: colors.ok, backgroundColor: colors.okBg },
  inputBad: { borderColor: colors.bad, backgroundColor: colors.badBg },
});
