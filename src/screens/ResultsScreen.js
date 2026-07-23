import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { colors, radius, shadow, spacing } from '../theme';
import { haptic, rankFor } from '../utils';

export default function ResultsScreen({ result, isRecord, onReplay, onHome }) {
  const { score, correct, total, streak } = result;
  const accuracy = total ? correct / total : 0;
  const percent = Math.round(accuracy * 100);
  const rank = rankFor(accuracy);

  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    haptic.success();
    Animated.spring(pop, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [pop]);

  const ringFill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(ringFill, {
      toValue: accuracy,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [accuracy, ringFill]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {isRecord && (
        <View style={styles.recordPill}>
          <Text style={styles.recordText}>NEW PERSONAL BEST</Text>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: pop }], alignItems: 'center' }}>
        <LinearGradient
          colors={['#12B368', '#065F3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.scoreOrb, shadow.glow(colors.green)]}
        >
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>points</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.rankTitle}>{rank.title}</Text>
      <Text style={styles.rankLine}>{rank.line}</Text>

      <Text style={styles.tally}>
        You got <Text style={styles.tallyStrong}>{correct} out of {total}</Text> correct ·{' '}
        <Text style={styles.tallyStrong}>{percent}%</Text>
      </Text>

      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: ringFill.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.grid}>
        <Cell value={`${correct}/${total}`} label="Score" />
        <Cell value={`${percent}%`} label="Percentage" />
        <Cell value={streak} label="Best streak" />
      </View>

      <Button title="Cook another batch" onPress={onReplay} style={styles.cta} />
      <Button title="Back to the lab" variant="ghost" onPress={onHome} style={styles.cta2} />
    </ScrollView>
  );
}

function Cell({ value, label }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellValue}>{value}</Text>
      <Text style={styles.cellLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(4),
    paddingBottom: spacing(4),
    alignItems: 'center',
  },
  recordPill: {
    backgroundColor: 'rgba(242,197,0,0.14)',
    borderColor: colors.yellow,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: spacing(2),
  },
  recordText: { color: colors.yellow, fontSize: 11, fontWeight: '800', letterSpacing: 1.6 },
  scoreOrb: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { color: colors.white, fontSize: 52, fontWeight: '900' },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  rankTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing(3),
  },
  rankLine: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tally: {
    color: colors.textDim,
    fontSize: 15,
    marginTop: spacing(2),
    textAlign: 'center',
  },
  tallyStrong: { color: colors.acid, fontWeight: '800' },
  barTrack: {
    height: 6,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: spacing(3),
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.acid },
  grid: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
    marginTop: spacing(2.5),
    marginBottom: spacing(4),
  },
  cell: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing(1.75),
    alignItems: 'center',
  },
  cellValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  cellLabel: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cta: { alignSelf: 'stretch' },
  cta2: { alignSelf: 'stretch', marginTop: spacing(1.5) },
});
