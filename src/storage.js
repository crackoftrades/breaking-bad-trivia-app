import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@bb_trivia_stats_v1';

export const emptyStats = {
  bestScore: 0,
  bestAccuracy: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  bestStreak: 0,
};

export async function loadStats() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...emptyStats, ...JSON.parse(raw) } : { ...emptyStats };
  } catch {
    return { ...emptyStats };
  }
}

export async function recordGame(stats, { score, correct, total, streak }) {
  const next = {
    bestScore: Math.max(stats.bestScore, score),
    bestAccuracy: Math.max(stats.bestAccuracy, total ? correct / total : 0),
    gamesPlayed: stats.gamesPlayed + 1,
    totalCorrect: stats.totalCorrect + correct,
    totalAnswered: stats.totalAnswered + total,
    bestStreak: Math.max(stats.bestStreak, streak),
  };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // non-fatal: stats just won't persist
  }
  return next;
}

export async function resetStats() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return { ...emptyStats };
}
