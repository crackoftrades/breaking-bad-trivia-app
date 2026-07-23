import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle a question's options while keeping track of the correct index. */
export function shuffleOptions(question) {
  const indexed = question.options.map((text, i) => ({ text, correct: i === question.answer }));
  const mixed = shuffle(indexed);
  return {
    ...question,
    options: mixed.map((o) => o.text),
    answer: mixed.findIndex((o) => o.correct),
  };
}

/** Haptics are a no-op on web and must never crash the round. */
export const haptic = {
  light: () => tap(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => tap(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => tap(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  heavy: () => tap(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
};

function tap(fn) {
  if (Platform.OS === 'web') return;
  try {
    fn();
  } catch {
    // ignore
  }
}

export const RANKS = [
  { min: 0.0, title: 'Skinny Pete', line: 'You know the vibe, not the details.' },
  { min: 0.3, title: 'Badger', line: 'Enthusiastic. Unreliable. Beloved.' },
  { min: 0.5, title: 'Jesse Pinkman', line: 'Talented, but you skipped a few classes.' },
  { min: 0.7, title: 'Mike Ehrmantraut', line: 'No half measures. Solid, professional work.' },
  { min: 0.85, title: 'Gustavo Fring', line: 'Meticulous. Composed. Slightly terrifying.' },
  { min: 1.0, title: 'Heisenberg', line: 'You are the one who knocks.' },
];

export function rankFor(accuracy) {
  let rank = RANKS[0];
  for (const r of RANKS) if (accuracy >= r.min) rank = r;
  return rank;
}
