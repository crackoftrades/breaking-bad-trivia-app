import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import ElementTile from '../components/ElementTile';
import { CATEGORIES, DIFFICULTY_LABELS, MIN_POOL } from '../data/trivia';
import { colors, radius, spacing } from '../theme';
import { haptic } from '../utils';

const TINTS = ['#0F9D58', '#2E7FA8', '#8E6C1F', '#7B3A2E', '#4A5D3A'];

export default function SetupScreen({
  category,
  difficulty,
  poolSize,
  roundSize = 10,
  onChange,
  onStart,
  onBack,
}) {
  const tooSmall = poolSize < MIN_POOL;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.h1}>Pick your batch</Text>
        <Text style={styles.sub}>Choose a subject and a purity level.</Text>

        <Text style={styles.section}>Category</Text>
        <View style={styles.grid}>
          <CategoryCard
            active={category === 'all'}
            symbol="All"
            label="Everything"
            blurb="Every category, all mixed"
            tint="#37474F"
            onPress={() => onChange({ category: 'all' })}
          />
          {CATEGORIES.map((c, i) => (
            <CategoryCard
              key={c.id}
              active={category === c.id}
              symbol={c.symbol}
              label={c.label}
              blurb={c.blurb}
              tint={TINTS[i % TINTS.length]}
              onPress={() => onChange({ category: c.id })}
            />
          ))}
        </View>

        <Text style={styles.section}>Difficulty</Text>
        <View style={styles.chipRow}>
          <Chip
            active={difficulty === 'all'}
            label="Mixed"
            onPress={() => onChange({ difficulty: 'all' })}
          />
          {[1, 2, 3].map((d) => (
            <Chip
              key={d}
              active={difficulty === d}
              label={DIFFICULTY_LABELS[d]}
              onPress={() => onChange({ difficulty: d })}
            />
          ))}
        </View>

        <Text style={[styles.poolNote, tooSmall && { color: colors.yellow }]}>
          {tooSmall
            ? 'Not enough questions in that combination — widen it.'
            : `${poolSize} questions in this pool · ${roundSize} per round`}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Let's cook" onPress={onStart} disabled={tooSmall} />
      </View>
    </View>
  );
}

function CategoryCard({ active, symbol, label, blurb, tint, onPress }) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      <ElementTile symbol={symbol} size={44} tint={tint} />
      <View style={styles.cardText}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.cardBlurb}>
          {blurb}
        </Text>
      </View>
      {active && <View style={styles.dot} />}
    </Pressable>
  );
}

function Chip({ active, label, onPress }) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2),
    paddingBottom: spacing(3),
  },
  back: { paddingVertical: 6, alignSelf: 'flex-start' },
  backText: { color: colors.textDim, fontSize: 16, fontWeight: '600' },
  h1: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing(1) },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 4 },
  section: {
    color: colors.textFaint,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: spacing(3),
    marginBottom: spacing(1.25),
    fontWeight: '700',
  },
  grid: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
  },
  cardActive: { borderColor: colors.green, backgroundColor: colors.cardAlt },
  cardText: { flex: 1, marginLeft: 12 },
  cardLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardBlurb: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.acid,
    marginRight: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.yellow, backgroundColor: 'rgba(242,197,0,0.12)' },
  chipText: { color: colors.textDim, fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: colors.yellow },
  poolNote: { color: colors.textFaint, fontSize: 12, marginTop: spacing(2) },
  footer: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(1.5),
    paddingBottom: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgAlt,
  },
});
