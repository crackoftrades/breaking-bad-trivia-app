import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ElementTile from '../components/ElementTile';
import { colors, radius, shadow, spacing } from '../theme';
import { haptic } from '../utils';

export default function ModeScreen({ onPickAI, onPickGeneral }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.logoRow}>
        <ElementTile symbol="Br" name="Bromine" number={35} size={64} tint={colors.greenDeep} />
        <ElementTile symbol="Ba" name="Barium" number={56} size={64} tint={colors.green} />
      </View>

      <Text style={styles.h1}>How do you want to play?</Text>
      <Text style={styles.sub}>Pick a mode to get cooking.</Text>

      <ModeCard
        onPress={onPickAI}
        gradient={['#5BC8F5', '#2E7FA8']}
        badge="AI"
        title="Play with AI"
        blurb="Type any topic and an AI writes you a fresh 10-question round."
      />

      <ModeCard
        onPress={onPickGeneral}
        gradient={['#12B368', '#065F3C']}
        badge="Bb"
        title="General Knowledge"
        blurb="The built-in Breaking Bad quiz — live questions, categories, no repeats."
      />
    </ScrollView>
  );
}

function ModeCard({ onPress, gradient, badge, title, blurb }) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, shadow.card]}
      >
        <Text style={styles.badgeText}>{badge}</Text>
      </LinearGradient>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBlurb}>{blurb}</Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing(3),
    paddingTop: spacing(5),
    paddingBottom: spacing(4),
  },
  logoRow: { flexDirection: 'row', gap: 10, marginBottom: spacing(3) },
  h1: { color: colors.text, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.textDim, fontSize: 14, marginTop: 6, marginBottom: spacing(3) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(2),
    marginBottom: spacing(2),
  },
  badge: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 22, fontWeight: '900' },
  cardText: { flex: 1, marginLeft: spacing(2) },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  cardBlurb: { color: colors.textFaint, fontSize: 13, marginTop: 4, lineHeight: 18 },
  chev: { color: colors.textFaint, fontSize: 28, fontWeight: '700', marginLeft: 8 },
});
