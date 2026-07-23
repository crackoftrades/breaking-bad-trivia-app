import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { CATEGORIES, DIFFICULTY_LABELS } from '../data/trivia';
import { colors, radius, shadow, spacing } from '../theme';
import { haptic } from '../utils';

const TIME_LIMIT = 20000; // ms per question
const BASE_POINTS = 100;
const MAX_TIME_BONUS = 100;
const STREAK_BONUS = 25;

export default function QuizScreen({ questions, onFinish, onQuit }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null); // index of chosen option, or -1 on timeout
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [eliminated, setEliminated] = useState([]);
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [lastGain, setLastGain] = useState(0);

  const question = questions[index];
  const revealed = picked !== null;

  const timerAnim = useRef(new Animated.Value(1)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;
  const startedAt = useRef(Date.now());
  const timeoutRef = useRef(null);
  const animRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    animRef.current?.stop();
  }, []);

  const settle = useCallback(
    (choice) => {
      clearTimers();
      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      const isRight = choice === question.answer;

      if (isRight) {
        const timeBonus = Math.round((remaining / TIME_LIMIT) * MAX_TIME_BONUS);
        const gain = BASE_POINTS + timeBonus + streak * STREAK_BONUS;
        setLastGain(gain);
        setScore((s) => s + gain);
        setCorrectCount((c) => c + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        haptic.success();
      } else {
        setLastGain(0);
        setStreak(0);
        haptic.error();
      }
      setPicked(choice);
    },
    [clearTimers, question, streak]
  );

  // Keep the expiry timeout pointing at the freshest `settle` closure.
  const settleRef = useRef(settle);
  useEffect(() => {
    settleRef.current = settle;
  }, [settle]);

  // Start (or restart) the clock whenever we land on a new question.
  useEffect(() => {
    setPicked(null);
    setEliminated([]);
    setLastGain(0);
    startedAt.current = Date.now();

    timerAnim.setValue(1);
    animRef.current = Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIME_LIMIT,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animRef.current.start();

    enterAnim.setValue(0);
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(() => settleRef.current(-1), TIME_LIMIT);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const next = () => {
    if (index + 1 >= questions.length) {
      onFinish({
        score,
        correct: correctCount,
        total: questions.length,
        streak: bestStreak,
      });
    } else {
      setIndex((i) => i + 1);
    }
  };

  const useFifty = () => {
    if (fiftyUsed || revealed) return;
    haptic.heavy();
    const wrong = question.options
      .map((_, i) => i)
      .filter((i) => i !== question.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    setEliminated(wrong);
    setFiftyUsed(true);
  };

  const barWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const barColor = timerAnim.interpolate({
    inputRange: [0, 0.25, 0.6, 1],
    outputRange: [colors.danger, colors.danger, colors.yellow, colors.green],
  });

  const categoryLabel = useMemo(
    // Built-in categories map to a friendly label; AI rounds use their free-text
    // category as-is.
    () => CATEGORIES.find((c) => c.id === question.category)?.label ?? question.category ?? 'Trivia',
    [question.category]
  );

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable onPress={onQuit} hitSlop={12}>
          <Text style={styles.quit}>✕</Text>
        </Pressable>

        <View style={styles.dots}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < index && styles.dotDone,
                i === index && styles.dotCurrent,
              ]}
            />
          ))}
        </View>

        <Text style={styles.scoreText}>{score}</Text>
      </View>

      <View style={styles.timerTrack}>
        <Animated.View
          style={[styles.timerFill, { width: barWidth, backgroundColor: barColor }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: enterAnim,
            transform: [
              {
                translateY: enterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {categoryLabel} · {DIFFICULTY_LABELS[question.difficulty]}
            </Text>
            {streak >= 2 && !revealed && (
              <Text style={styles.streak}>🔥 {streak} streak</Text>
            )}
          </View>

          <Text style={styles.question}>{question.q}</Text>

          <View style={styles.options}>
            {question.options.map((opt, i) => (
              <Option
                key={i}
                text={opt}
                letter={String.fromCharCode(65 + i)}
                hidden={eliminated.includes(i)}
                state={
                  !revealed
                    ? 'idle'
                    : i === question.answer
                    ? 'correct'
                    : i === picked
                    ? 'wrong'
                    : 'muted'
                }
                onPress={() => !revealed && settle(i)}
              />
            ))}
          </View>

          {revealed && (
            <View
              style={[
                styles.reveal,
                picked === question.answer ? styles.revealGood : styles.revealBad,
              ]}
            >
              <Text style={styles.revealTitle}>
                {picked === question.answer
                  ? `Correct  +${lastGain}`
                  : picked === -1
                  ? "Time's up"
                  : 'Wrong'}
              </Text>
              <Text style={styles.revealFact}>{question.fact}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {revealed ? (
          <Button
            title={index + 1 >= questions.length ? 'See results' : 'Next question'}
            onPress={next}
          />
        ) : (
          <Pressable
            onPress={useFifty}
            disabled={fiftyUsed}
            style={({ pressed }) => [
              styles.lifeline,
              fiftyUsed && styles.lifelineUsed,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.lifelineText, fiftyUsed && styles.lifelineTextUsed]}>
              {fiftyUsed ? 'Lifeline spent' : '50 / 50  ·  cut two wrong answers'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Option({ text, letter, state, hidden, onPress }) {
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: hidden ? 0.15 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [hidden, fade]);

  const body = (
    <View style={styles.optRow}>
      <View style={[styles.letter, state === 'correct' && styles.letterOn]}>
        <Text style={styles.letterText}>{letter}</Text>
      </View>
      <Text style={styles.optText}>{text}</Text>
      {state === 'correct' && <Text style={styles.mark}>✓</Text>}
      {state === 'wrong' && <Text style={styles.mark}>✕</Text>}
    </View>
  );

  return (
    <Animated.View style={{ opacity: fade }}>
      <Pressable
        onPress={onPress}
        disabled={hidden || state !== 'idle'}
        style={({ pressed }) => [
          styles.opt,
          state === 'muted' && styles.optMuted,
          pressed && state === 'idle' && styles.optPressed,
          state === 'correct' && shadow.glow(colors.green),
        ]}
      >
        {state === 'correct' ? (
          <LinearGradient
            colors={['#12B368', '#08633A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.optFill}
          >
            {body}
          </LinearGradient>
        ) : state === 'wrong' ? (
          <LinearGradient
            colors={['#B23A1B', '#6E1F0C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.optFill}
          >
            {body}
          </LinearGradient>
        ) : (
          <View style={styles.optFill}>{body}</View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.25),
  },
  quit: { color: colors.textDim, fontSize: 20, fontWeight: '700', width: 40 },
  dots: { flexDirection: 'row', gap: 5, flex: 1, justifyContent: 'center' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotDone: { backgroundColor: colors.greenDeep },
  dotCurrent: { backgroundColor: colors.acid, width: 16 },
  scoreText: {
    color: colors.yellow,
    fontSize: 17,
    fontWeight: '800',
    width: 60,
    textAlign: 'right',
  },
  timerTrack: {
    height: 4,
    backgroundColor: colors.border,
    marginHorizontal: spacing(2.5),
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerFill: { height: '100%' },
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2.5),
    paddingBottom: spacing(3),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  meta: {
    color: colors.textFaint,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  streak: { color: colors.yellow, fontSize: 12, fontWeight: '700' },
  question: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: spacing(3),
  },
  options: { gap: 10 },
  opt: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  optFill: { paddingVertical: 14, paddingHorizontal: 12 },
  optMuted: { opacity: 0.45 },
  optPressed: { backgroundColor: colors.cardAlt, borderColor: colors.green },
  optRow: { flexDirection: 'row', alignItems: 'center' },
  letter: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  letterOn: { backgroundColor: 'rgba(0,0,0,0.25)' },
  letterText: { color: colors.textDim, fontSize: 12, fontWeight: '800' },
  optText: { color: colors.text, fontSize: 15.5, flex: 1, lineHeight: 21 },
  mark: { color: colors.white, fontSize: 16, fontWeight: '800', marginLeft: 8 },
  reveal: {
    marginTop: spacing(2.5),
    borderRadius: radius.md,
    padding: spacing(2),
    borderLeftWidth: 4,
    backgroundColor: colors.card,
  },
  revealGood: { borderLeftColor: colors.green },
  revealBad: { borderLeftColor: colors.danger },
  revealTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  revealFact: { color: colors.textDim, fontSize: 13.5, lineHeight: 20 },
  footer: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(1.5),
    paddingBottom: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgAlt,
  },
  lifeline: {
    paddingVertical: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.yellow,
    alignItems: 'center',
  },
  lifelineUsed: { borderColor: colors.border },
  lifelineText: {
    color: colors.yellow,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },
  lifelineTextUsed: { color: colors.textFaint },
});
