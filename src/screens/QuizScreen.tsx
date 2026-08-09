import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerField } from '@/components/AnswerField';
import { AppBar } from '@/components/AppBar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PortraitPrompt } from '@/components/PortraitPrompt';
import { RevealPanel } from '@/components/RevealPanel';
import { TextLink } from '@/components/TextLink';
import { givenLabel, isModeKey, type FieldKey } from '@/lib/domain';
import { parseRangeIn, pool, rangeText, type Range } from '@/lib/range';
import { Deck, answerFields, grade, pickGiven, type Grade, type Question } from '@/lib/quiz';
import { useDomain } from '@/state/DomainContext';
import { useRange } from '@/state/RangeContext';
import { colors, fonts, type, useLayout } from '@/theme';

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

export function QuizScreen() {
  const domain = useDomain();
  const params = useLocalSearchParams<{ mode: string; range?: string }>();
  const { range: storedRange } = useRange();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { wide, maxWidth, gutter } = useLayout();

  // The route may carry a range (web deep links keep a round shareable);
  // otherwise fall back to the persisted choice. Clamped on the way in, so a
  // hand-edited URL cannot select an empty pool.
  const activeRange: Range = useMemo(
    () => parseRangeIn(domain, params.range) ?? storedRange,
    [domain, params.range, storedRange]
  );

  const [state, dispatch] = useReducer(reducer, initialState);
  const deckRef = useRef<Deck | null>(null);
  /* One slot per answer field, so the return key can walk the whole chain.
   * Mixed alternates between counts, hence an array. */
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const nextButtonRef = useRef<View | null>(null);

  const picks = useMemo(() => pool(domain, activeRange), [domain, activeRange]);

  const nextQuestion = useCallback(() => {
    if (!deckRef.current) return;
    const rec = deckRef.current.draw();
    const given = pickGiven(domain, isModeKey(domain, params.mode) ? params.mode : 'mixed');
    inputRefs.current = [];
    dispatch({ kind: 'next', q: { rec, given, answers: answerFields(domain, given) } });
  }, [domain, params.mode]);

  // Build the deck and ask the first question; rebuild if the range changes.
  useEffect(() => {
    if (!picks.length) return;
    deckRef.current = new Deck(picks);
    nextQuestion();
  }, [picks, nextQuestion]);

  /* Web only: hand focus to "Next question" once the answer is graded, so the
   * whole round is playable from the keyboard — type, Enter to check, Enter to
   * advance. On a phone the button is a touch target and stealing focus would
   * only re-raise the keyboard. */
  useEffect(() => {
    if (Platform.OS !== 'web' || !state.result) return;
    nextButtonRef.current?.focus();
  }, [state.result]);

  const onGrade = useCallback(() => {
    if (!state.q || state.result) return;
    const result = grade(domain, state.q, state.inputs);
    Keyboard.dismiss();
    void Haptics.notificationAsync(
      result.allRight
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    dispatch({ kind: 'grade', result });
  }, [domain, state.q, state.inputs, state.result]);

  if (!isModeKey(domain, params.mode)) {
    return <Redirect href={domain.key === 'us' ? '/us' : '/ru'} />;
  }

  const mode = params.mode;
  const q = state.q;

  // The web build used clamp(1.7rem, 7vw, 2.3rem) — styles.css:420.
  const givenFontSize = Math.max(27, Math.min(37, width * 0.07));

  return (
    <View style={styles.root}>
      <AppBar score={{ right: state.right, asked: state.asked }} />

      {/* Replaces a KeyboardAvoidingView that was inert on Android: under
       * edge-to-edge the window no longer resizes for the keyboard, so the last
       * of a portrait question's answer fields sat underneath it. This both
       * makes room and scrolls the focused field into it. */}
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: gutter, paddingBottom: insets.bottom + 24 },
        ]}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, { maxWidth }]}>
          {/* .mode-tag — app.js:341. The separator dot is tan, the range stone. */}
          <Text style={styles.modeTag}>
            {domain.modes[mode].title}
            <Text style={styles.tagDot}> · </Text>
            <Text style={styles.tagRange}>{rangeText(domain, activeRange)}</Text>
          </Text>

          {q ? (
            <Card style={[styles.card, wide && styles.cardWide]}>
              <Text style={styles.givenLabel}>{givenLabel(domain, q.given)}</Text>
              {q.given === 'portrait' ? (
                <PortraitPrompt domain={domain} no={q.rec.no} />
              ) : (
                <Text
                  style={[
                    styles.givenValue,
                    { fontSize: givenFontSize, lineHeight: givenFontSize * 1.15 },
                    q.given !== 'name' && { color: domain.accent },
                    q.given !== 'name' && styles.givenNumeric,
                  ]}>
                  {domain.fields[q.given].show(q.rec)}
                </Text>
              )}

              <View style={styles.fields}>
                {q.answers.map((f, i) => {
                  const last = i === q.answers.length - 1;
                  return (
                    <AnswerField
                      key={`${state.qIndex}-${f}`}
                      // Block body: React 19 treats a returned value from a
                      // callback ref as a cleanup function and throws.
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      spec={domain.fields[f]}
                      value={state.inputs[f] ?? ''}
                      onChangeText={(v) => dispatch({ kind: 'input', field: f, value: v })}
                      mark={state.result ? (state.result.marks[f] ?? false) : null}
                      // A portrait has to be looked at first; raising the
                      // keyboard would scroll the whole prompt off-screen.
                      // The web has no on-screen keyboard, so it focuses
                      // every prompt, portraits included.
                      autoFocus={
                        i === 0 &&
                        !state.result &&
                        (Platform.OS === 'web' || q.given !== 'portrait')
                      }
                      returnKeyType={last ? 'done' : 'next'}
                      onSubmitEditing={last ? onGrade : () => inputRefs.current[i + 1]?.focus()}
                    />
                  );
                })}
              </View>

              {state.result ? (
                <RevealPanel
                  domain={domain}
                  allRight={state.result.allRight}
                  terms={state.result.terms}
                  givenName={q.rec.givenName}
                />
              ) : null}

              {/* .actions — full width on phones, 12rem wide past the
                  breakpoint (styles.css:592). */}
              <View style={styles.actions}>
                {state.result ? (
                  <Button
                    ref={nextButtonRef}
                    label={domain.strings.next}
                    onPress={nextQuestion}
                    style={wide && styles.buttonWide}
                  />
                ) : (
                  <Button
                    label={domain.strings.check}
                    onPress={onGrade}
                    style={wide && styles.buttonWide}
                  />
                )}
              </View>
            </Card>
          ) : (
            <Card style={styles.card}>
              <Text style={type.body}>{domain.strings.emptyPool}</Text>
            </Card>
          )}

          <Text style={styles.hint}>{domain.strings.hint}</Text>

          <TextLink
            label={domain.strings.back}
            onPress={() => router.navigate(domain.key === 'us' ? '/us' : '/ru')}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { alignItems: 'center', paddingTop: 16 },
  inner: { width: '100%', gap: 16 },

  modeTag: type.eyebrow,
  tagDot: { color: colors.tan },
  tagRange: { color: colors.stone },

  card: { paddingVertical: 24, paddingHorizontal: 20, gap: 20 },
  cardWide: { paddingVertical: 32, paddingHorizontal: 28 },

  givenLabel: type.eyebrow,
  givenValue: {
    fontFamily: fonts.serifBold,
    color: colors.ink,
    letterSpacing: -0.3,
    // Pulls the value up under its label; the web build did the same with a
    // -0.9rem top margin against the card's 1.25rem gap (styles.css:418).
    marginTop: -14,
  },
  givenNumeric: { fontVariant: ['tabular-nums'] },

  fields: { gap: 14 },
  actions: { flexDirection: 'row' },
  buttonWide: { flex: 0, minWidth: 192 },

  hint: { fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center' },
});
