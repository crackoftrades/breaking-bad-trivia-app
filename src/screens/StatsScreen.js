import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { RANKS, rankFor } from '../utils';

export default function StatsScreen({ stats, onBack, onReset }) {
  const accuracy = stats.totalAnswered ? stats.totalCorrect / stats.totalAnswered : 0;
  const current = rankFor(accuracy);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.h1}>Your record</Text>
      <Text style={styles.sub}>
        {stats.gamesPlayed === 0
          ? 'No rounds yet. The lab is cold.'
          : `Standing: ${current.title}`}
      </Text>

      <View style={styles.rows}>
        <Row label="Best score" value={stats.bestScore} />
        <Row label="Rounds played" value={stats.gamesPlayed} />
        <Row label="Questions answered" value={stats.totalAnswered} />
        <Row label="Correct answers" value={stats.totalCorrect} />
        <Row label="Lifetime accuracy" value={`${Math.round(accuracy * 100)}%`} />
        <Row label="Best single-round accuracy" value={`${Math.round(stats.bestAccuracy * 100)}%`} />
        <Row label="Longest streak" value={stats.bestStreak} />
      </View>

      <Text style={styles.section}>Ranks</Text>
      {RANKS.map((r) => {
        const unlocked = accuracy >= r.min && stats.gamesPlayed > 0;
        return (
          <View key={r.title} style={[styles.rank, unlocked && styles.rankOn]}>
            <Text style={[styles.rankPct, unlocked && { color: colors.acid }]}>
              {Math.round(r.min * 100)}%
            </Text>
            <View style={styles.rankBody}>
              <Text style={[styles.rankName, unlocked && { color: colors.text }]}>{r.title}</Text>
              <Text style={styles.rankLine}>{r.line}</Text>
            </View>
          </View>
        );
      })}

      <Button title="Erase the record" variant="ghost" onPress={onReset} style={styles.reset} />
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2),
    paddingBottom: spacing(4),
  },
  back: { paddingVertical: 6, alignSelf: 'flex-start' },
  backText: { color: colors.textDim, fontSize: 16, fontWeight: '600' },
  h1: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing(1) },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 4 },
  rows: {
    marginTop: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.textDim, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 16, fontWeight: '800' },
  section: {
    color: colors.textFaint,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: spacing(3.5),
    marginBottom: spacing(1.25),
    fontWeight: '700',
  },
  rank: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(1.5),
    borderRadius: radius.sm,
    marginBottom: 6,
    opacity: 0.55,
  },
  rankOn: { backgroundColor: colors.card, opacity: 1 },
  rankPct: {
    width: 48,
    color: colors.textFaint,
    fontWeight: '800',
    fontSize: 13,
  },
  rankBody: { flex: 1 },
  rankName: { color: colors.textDim, fontSize: 15, fontWeight: '700' },
  rankLine: { color: colors.textFaint, fontSize: 12, marginTop: 1 },
  reset: { marginTop: spacing(3) },
});
