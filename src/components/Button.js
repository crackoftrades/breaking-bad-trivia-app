import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadow } from '../theme';
import { haptic } from '../utils';

export default function Button({ title, subtitle, onPress, variant = 'primary', disabled, style }) {
  const isPrimary = variant === 'primary';

  const content = (
    <View style={styles.inner}>
      <Text style={[styles.title, !isPrimary && styles.titleGhost]}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        haptic.light();
        onPress?.();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        isPrimary && shadow.glow(colors.green),
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={['#12B368', '#07713F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.grad}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={styles.ghost}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: 'hidden' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.4 },
  grad: { paddingVertical: 16, paddingHorizontal: 22 },
  ghost: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  inner: { alignItems: 'center' },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  titleGhost: { color: colors.text },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 },
});
