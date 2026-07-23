import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import ElementTile from '../components/ElementTile';
import { colors, radius, spacing } from '../theme';

export default function HomeScreen({ stats, questionCount = 0, onStart, onStats, onBack }) {
  const accuracy = stats.totalAnswered
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>‹ Modes</Text>
        </Pressable>
      )}

      <View style={styles.logoRow}>
        <ElementTile symbol="Br" name="Bromine" number={35} size={78} tint={colors.greenDeep} />
        <Text style={styles.logoWord}>eaking</Text>
      </View>
      <View style={[styles.logoRow, { marginTop: 6 }]}>
        <ElementTile symbol="Ba" name="Barium" number={56} size={78} tint={colors.green} />
        <Text style={styles.logoWord}>d</Text>
      </View>

      <LinearGradient
        colors={['#F2C500', '#C79A00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.titleBadge}
      >
        <Text style={styles.titleBadgeText}>TRIVIA</Text>
      </LinearGradient>

      <Text style={styles.tagline}>
        {questionCount} live questions from the Albuquerque underworld.{'\n'}
        Ten per round. Twenty seconds each. No half measures.
      </Text>

      <View style={styles.statRow}>
        <Stat label="Best score" value={stats.bestScore} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Rounds" value={stats.gamesPlayed} />
      </View>

      <Button title="Start cooking" onPress={onStart} style={styles.cta} />
      <Button title="Your record" variant="ghost" onPress={onStats} style={styles.cta2} />

      <Text style={styles.footer}>
        “I am not in danger, Skyler.{'\n'}I am the danger.”
      </Text>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(2),
    paddingBottom: spacing(5),
    alignItems: 'center',
  },
  back: { alignSelf: 'flex-start', paddingVertical: 6, marginBottom: spacing(1) },
  backText: { color: colors.textDim, fontSize: 16, fontWeight: '600' },
  logoRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  logoWord: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 8,
  },
  titleBadge: {
    marginTop: spacing(2),
    paddingHorizontal: 26,
    paddingVertical: 8,
    borderRadius: radius.sm,
    transform: [{ rotate: '-1.5deg' }],
  },
  titleBadgeText: {
    color: '#151A0E',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
  },
  tagline: {
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing(2.5),
    fontSize: 13,
    lineHeight: 20,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing(4),
    marginBottom: spacing(4),
    gap: 10,
    alignSelf: 'stretch',
  },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing(1.75),
    alignItems: 'center',
  },
  statValue: { color: colors.acid, fontSize: 22, fontWeight: '800' },
  statLabel: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cta: { alignSelf: 'stretch' },
  cta2: { alignSelf: 'stretch', marginTop: spacing(1.5) },
  footer: {
    color: colors.textFaint,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing(5),
    fontSize: 12,
    lineHeight: 19,
  },
});
