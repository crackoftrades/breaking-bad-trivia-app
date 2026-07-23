import { useCallback, useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import ModeScreen from './src/screens/ModeScreen';
import AICategoryScreen from './src/screens/AICategoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import StatsScreen from './src/screens/StatsScreen';
import LoadingScreen from './src/screens/LoadingScreen';

import { loadTrivia, nextRound, poolSize, roundSizeFor, totalQuestions } from './src/data/trivia';
import { generateAIQuestions } from './src/data/ai';
import { emptyStats, loadStats, recordGame, resetStats } from './src/storage';
import { colors, gradients } from './src/theme';

const ROUND_SIZE = 10;

export default function App() {
  const [screen, setScreen] = useState('mode');
  const [mode, setMode] = useState('gk'); // 'gk' (Breaking Bad game) | 'ai'
  const [status, setStatus] = useState('loading'); // Breaking Bad data: 'loading' | 'ready' | 'error'
  const [stats, setStats] = useState(emptyStats);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [isRecord, setIsRecord] = useState(false);

  // AI mode
  const [aiCategory, setAiCategory] = useState('');
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [aiError, setAiError] = useState('');

  const load = useCallback(() => {
    setStatus('loading');
    loadTrivia()
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    load();
    loadStats().then(setStats);
  }, [load]);

  const startRound = useCallback(() => {
    const picked = nextRound({ category, difficulty, size: ROUND_SIZE });
    if (picked.length === 0) return;
    setMode('gk');
    setQuestions(picked);
    setScreen('quiz');
  }, [category, difficulty]);

  const generateAI = useCallback(async (cat) => {
    setAiCategory(cat);
    setAiError('');
    setAiStatus('loading');
    setScreen('ai');
    try {
      const qs = await generateAIQuestions(cat);
      setMode('ai');
      setQuestions(qs);
      setAiStatus('idle');
      setScreen('quiz');
    } catch (e) {
      setAiError(String(e?.message || e));
      setAiStatus('error');
    }
  }, []);

  const finishRound = useCallback(
    async (r) => {
      setResult(r);
      setIsRecord(r.score > stats.bestScore);
      setScreen('results');
      setStats(await recordGame(stats, r));
    },
    [stats]
  );

  const replay = useCallback(() => {
    if (mode === 'ai') generateAI(aiCategory);
    else startRound();
  }, [mode, aiCategory, generateAI, startRound]);

  const quizExit = mode === 'ai' ? 'ai' : 'home';

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      <ExpoStatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        {screen === 'mode' && (
          <ModeScreen
            onPickAI={() => {
              setAiStatus('idle');
              setAiError('');
              setScreen('ai');
            }}
            onPickGeneral={() => {
              setMode('gk');
              setScreen('home');
            }}
          />
        )}

        {screen === 'ai' && (
          <AICategoryScreen
            status={aiStatus}
            error={aiError}
            onGenerate={generateAI}
            onBack={() => setScreen('mode')}
          />
        )}

        {/* General Knowledge (Breaking Bad) screens need the fetched dataset. */}
        {screen === 'home' &&
          (status !== 'ready' ? (
            <LoadingScreen status={status} onRetry={load} />
          ) : (
            <HomeScreen
              stats={stats}
              questionCount={totalQuestions()}
              onStart={() => setScreen('setup')}
              onStats={() => setScreen('stats')}
              onBack={() => setScreen('mode')}
            />
          ))}

        {screen === 'setup' &&
          (status !== 'ready' ? (
            <LoadingScreen status={status} onRetry={load} />
          ) : (
            <SetupScreen
              category={category}
              difficulty={difficulty}
              roundSize={roundSizeFor(category, difficulty, ROUND_SIZE)}
              poolSize={poolSize(category, difficulty)}
              onChange={({ category: c, difficulty: d }) => {
                if (c !== undefined) setCategory(c);
                if (d !== undefined) setDifficulty(d);
              }}
              onStart={startRound}
              onBack={() => setScreen('home')}
            />
          ))}

        {screen === 'quiz' && (
          <QuizScreen
            key={questions.map((q) => q.id).join('-')}
            questions={questions}
            onFinish={finishRound}
            onQuit={() => setScreen(quizExit)}
          />
        )}

        {screen === 'results' && result && (
          <ResultsScreen
            result={result}
            isRecord={isRecord}
            onReplay={replay}
            onHome={() => setScreen(mode === 'ai' ? 'mode' : 'home')}
          />
        )}

        {screen === 'stats' && (
          <StatsScreen
            stats={stats}
            onBack={() => setScreen('home')}
            onReset={async () => setStats(await resetStats())}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
});
