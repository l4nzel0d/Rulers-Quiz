import { Redirect, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerField } from '@/components/AnswerField';
import { AppBar } from '@/components/AppBar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { RevealPanel } from '@/components/RevealPanel';
import { FIELDS, MODES, isModeKey, type FieldKey } from '@/lib/fields';
import { parseRange, pool, rangeText, type Range } from '@/lib/range';
import { Deck, answerFields, grade, pickGiven, type Grade, type Question } from '@/lib/quiz';
import { useRange } from '@/state/RangeContext';
import { MAX_CONTENT_WIDTH, colors, fonts, spacing, type } from '@/theme';

type State = {
  asked: number;
  right: number;
  /** Increments per question drawn; keys the inputs so they reset cleanly. */
  qIndex: number;
  q: Question | null;
  inputs: Record<string, string>;
  result: Grade | null;
};

type Action =
  | { kind: 'next'; q: Question }
  | { kind: 'input'; field: FieldKey; value: string }
  | { kind: 'grade'; result: Grade };

const initialState: State = {
  asked: 0,
  right: 0,
  qIndex: 0,
  q: null,
  inputs: {},
  result: null,
};

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case 'next':
      return { ...state, q: action.q, qIndex: state.qIndex + 1, inputs: {}, result: null };
    case 'input':
      return { ...state, inputs: { ...state.inputs, [action.field]: action.value } };
    case 'grade': {
      if (!state.q || state.result) return state;
      return {
        ...state,
        result: action.result,
        asked: state.asked + 1,
        right: state.right + (action.result.allRight ? 1 : 0),
      };
    }
  }
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{ mode: string; range?: string }>();
  const { range: storedRange } = useRange();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // The route may carry a range (web deep links keep a round shareable);
  // otherwise fall back to the persisted choice.
  const activeRange: Range = useMemo(
    () => parseRange(params.range) ?? storedRange,
    [params.range, storedRange]
  );

  const [state, dispatch] = useReducer(reducer, initialState);
  const deckRef = useRef<Deck | null>(null);
  const secondInputRef = useRef<TextInput>(null);

  const picks = useMemo(() => pool(activeRange), [activeRange]);

  const nextQuestion = useCallback(() => {
    if (!deckRef.current) return;
    const rec = deckRef.current.draw();
    const given = pickGiven(isModeKey(params.mode) ? params.mode : 'mixed');
    dispatch({ kind: 'next', q: { rec, given, answers: answerFields(given) } });
  }, [params.mode]);

  // Build the deck and ask the first question; rebuild if the range changes.
  useEffect(() => {
    if (!picks.length) return;
    deckRef.current = new Deck(picks);
    nextQuestion();
  }, [picks, nextQuestion]);

  const onGrade = useCallback(() => {
    if (!state.q || state.result) return;
    const result = grade(state.q, state.inputs);
    Keyboard.dismiss();
    void Haptics.notificationAsync(
      result.allRight
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    dispatch({ kind: 'grade', result });
  }, [state.q, state.inputs, state.result]);

  if (!isModeKey(params.mode)) return <Redirect href="/" />;

  const mode = params.mode;
  const q = state.q;

  // The web build used clamp(1.7rem, 7vw, 2.3rem) for the prompt value.
  const givenFontSize = Math.max(27, Math.min(37, width * 0.07));

  return (
    <View style={styles.root}>
      <AppBar
        title={MODES[mode].title}
        showBack
        right={
          <Text style={styles.score}>
            {state.right} / {state.asked}
          </Text>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <Text style={styles.rangeTag}>{rangeText(activeRange)}</Text>

            {q ? (
              <Card style={styles.card}>
                <Text style={styles.givenLabel}>{FIELDS[q.given].label}</Text>
                <Text
                  style={[
                    styles.givenValue,
                    { fontSize: givenFontSize, lineHeight: givenFontSize * 1.2 },
                    q.given !== 'name' && styles.givenNumeric,
                  ]}>
                  {FIELDS[q.given].show(q.rec)}
                </Text>

                <View style={styles.fields}>
                  {q.answers.map((f, i) => (
                    <AnswerField
                      key={`${state.qIndex}-${f}`}
                      ref={i === 1 ? secondInputRef : undefined}
                      field={f}
                      value={state.inputs[f] ?? ''}
                      onChangeText={(v) => dispatch({ kind: 'input', field: f, value: v })}
                      mark={state.result ? (state.result.marks[f] ?? false) : null}
                      autoFocus={i === 0 && !state.result}
                      returnKeyType={i === 0 ? 'next' : 'done'}
                      onSubmitEditing={
                        i === 0 ? () => secondInputRef.current?.focus() : onGrade
                      }
                    />
                  ))}
                </View>

                {state.result ? (
                  <RevealPanel
                    allRight={state.result.allRight}
                    terms={state.result.terms}
                    givenName={q.rec.givenName}
                  />
                ) : null}

                {state.result ? (
                  <Button label="Next question" onPress={nextQuestion} />
                ) : (
                  <Button label="Check" onPress={onGrade} />
                )}
              </Card>
            ) : (
              <Card style={styles.card}>
                <Text style={type.body}>No presidents in this range.</Text>
              </Card>
            )}

            <Text style={styles.hint}>
              Full names only — birth names accepted where they differ.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, gap: spacing.md },
  score: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.brown,
    fontVariant: ['tabular-nums'],
  },
  rangeTag: { ...type.small, color: colors.brown },
  card: { gap: spacing.lg },
  givenLabel: { ...type.label, textTransform: 'uppercase' },
  givenValue: { fontFamily: fonts.serif, color: colors.ink },
  givenNumeric: { fontVariant: ['tabular-nums'] },
  fields: { gap: spacing.md },
  hint: { ...type.small, color: colors.stone },
});
