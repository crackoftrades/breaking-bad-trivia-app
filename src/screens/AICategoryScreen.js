import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '../components/Button';
import { colors, radius, spacing } from '../theme';
import { haptic } from '../utils';

const SUGGESTIONS = ['Space exploration', 'World capitals', '90s hip-hop', 'Greek mythology', 'The Office'];

export default function AICategoryScreen({ status, error, onGenerate, onBack }) {
  const [text, setText] = useState('');
  const loading = status === 'loading';
  const trimmed = text.trim();

  const submit = () => {
    if (!trimmed || loading) return;
    Keyboard.dismiss();
    haptic.light();
    onGenerate(trimmed);
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.meth} size="large" />
        <Text style={styles.loadingTitle}>Cooking up questions…</Text>
        <Text style={styles.loadingSub}>The AI is writing a round about “{trimmed}”.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.h1}>Pick a topic</Text>
      <Text style={styles.sub}>Type anything — the AI will write 10 questions about it.</Text>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="e.g. The solar system"
        placeholderTextColor={colors.textFaint}
        autoFocus
        maxLength={100}
        returnKeyType="go"
        onSubmitEditing={submit}
        editable={!loading}
      />

      <View style={styles.chips}>
        {SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => {
              haptic.light();
              setText(s);
            }}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button
        title="Generate 10 questions"
        onPress={submit}
        disabled={!trimmed}
        style={styles.cta}
      />
    </ScrollView>
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
  sub: { color: colors.textDim, fontSize: 13, marginTop: 4, marginBottom: spacing(3) },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.75),
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing(2) },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipText: { color: colors.textDim, fontWeight: '600', fontSize: 13 },
  errorBox: {
    marginTop: spacing(2.5),
    backgroundColor: 'rgba(224,62,45,0.12)',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing(1.75),
  },
  errorText: { color: '#F3A79B', fontSize: 13.5, lineHeight: 19 },
  cta: { marginTop: spacing(3) },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(4) },
  loadingTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: spacing(2) },
  loadingSub: { color: colors.textDim, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
